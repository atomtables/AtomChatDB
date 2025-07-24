import { error } from "@sveltejs/kit";
import { type RequestEvent, type Peer } from "@sveltejs/kit";
import {db} from "$lib/server/db/index.js";
import * as schema from "$lib/server/db/schema.js";
import {desc, eq} from "drizzle-orm";
import {validateGuestSessionToken, validateSessionToken} from "$lib/server/auth.js";
import {groupaddr} from "$lib/server/db/schema.js";
import {getPeers} from "$app/server";
import * as fs from "node:fs";
/**
 * 3000 - unauthorised
 * 3001 - incorrect data
 * 3003 - accessing forbidden data
 * 3008 - timeout
 */

type Timeout = ReturnType<typeof setTimeout>
type Interval = ReturnType<typeof setInterval>;
enum PeerStatus {
    idle,
    stage1,
    stage2,
    stage3
}
enum PeerWaiting {
    Server,
    Client
}
type User = {
    id: string
    birth: Date
    person: string
    username: string
    isGuest: boolean
    image?: boolean
}
type PeerProperty = [PeerStatus, PeerWaiting, Timeout | null, Interval | null]
interface PeerData {
    ping: PeerProperty,
    verify: PeerProperty,
    verified?: boolean
    errors: number,
    identity: User,
    peer: Peer,
    broadcasted: boolean,
    address: string
}

let peers: {
    [peer: string]: PeerData
} = {};

const errors = {
    failedparse(peer: Peer) {peer.send(JSON.stringify({sub: "error", type: "failed_parse", errors: ++peers[peer.id].errors}))},
    invalidstate(peer: Peer, data: string) {peer.send(JSON.stringify({sub: "error", type: "invalid state", errors: ++peers[peer.id].errors, data}))},
    permissiondenied(peer: Peer) {peer.send(JSON.stringify({sub: "error", type: "permission_denied", errors: ++peers[peer.id].errors}))}
}

// setup is designed to be server run: clients only respond when server responds.
export const socket = {
    async upgrade(request: RequestEvent) {
        let addr = request.params.address;
        if (!addr) {
            return error(400, {message: 'Address is required'});
        }
        if (!/^[a-z.]+$/.test(addr)) {
            return error(400, {message: 'Invalid address format'});
        }
        let [server] = await db
            .select()
            .from(schema.groups)
            .where(eq(schema.groups.address, addr))
            .limit(1);

        if (!server) {
            return error(404, {message: 'Address not found'});
        }
        if (server.type !== 'chat') {
            return error(404, {message: 'This address is not a chat server'});
        }
        console.log(`client attempted upgrade to ${addr}`);
        return {};
    },
    async open(peer: Peer) {
        console.log(`${peer.id.slice(0, 8)} => ${getPeerAddress(peer)}`);
        sendPeer(peer, {
            sub: "verify",
            type: 'request',
            timeout: 60
        })
        peers[peer.id] = {
            verify: [
                PeerStatus.stage1,
                PeerWaiting.Client,
                setTimeout(() => killPeer(peer), 60000),
                setInterval(() => {
                if (!peers[peer.id]) { clearInterval(peers[peer.id]?.verify[3]); return; }
                let [status, party, timeout] = peers[peer.id].verify;
                if (status === PeerStatus.idle && party === PeerWaiting.Server) {
                    sendPeer(peer, {sub: "verify", type: "request", timeout: 60});
                    peers[peer.id].verify = [PeerStatus.stage1, PeerWaiting.Client, setTimeout(() => killPeer(peer), 60000), peers[peer.id].verify[3]];
                }
            }, 600000)
            ],
            ping: [PeerStatus.idle, PeerWaiting.Server, null, setInterval(() => {
                if (!peers[peer.id]) { clearInterval(peers[peer.id]?.ping[3]); return; }
                let [status, party, timeout] = peers[peer.id].ping;
                if (status === PeerStatus.idle && party === PeerWaiting.Server) {
                    sendPeer(peer, {sub: "ping"});
                    peers[peer.id].ping = [PeerStatus.stage1, PeerWaiting.Client, setTimeout(() => killPeer(peer), 15000), peers[peer.id].ping[3]];
                }
            }, 30000)],
            errors: 0,
            identity: null,
            peer,
            broadcasted: false,
            address: getPeerAddress(peer)
        }
    },
    async message(peer: Peer, msg: Buffer) {
        let table = groupaddr(peers[peer.id].address)
        let message: any;
        try { message = JSON.parse(msg.toString()) } catch (e) { errors.failedparse(peer); return; }

        switch (message.sub) {
            case 'verify':
                await verify(peer, message);
                break;
            case 'ping':
                await ping(peer, message);
                break;
            case 'data':
                if (!peers[peer.id]?.verified) errors.permissiondenied(peer)
                switch (message.type) {
                    case 'initial_request':
                        let current_messages = (await db
                            .select()
                            .from(table)
                            .orderBy(desc(table.createdAt)))
                            .map(m => {
                                if (m.deleted) {
                                    m.content = "[deleted message]";
                                    m.username = "[redacted]";
                                    m.authorId = null;
                                    m.image = null;
                                }
                                return m;
                            });
                        let users = Object.entries(peers)
                            .filter(([_, p]) => p.address === peers[peer.id].address)
                            .map(([_, p]) => p.identity)
                            .filter(u => u !== null)
                            .filter(u => u.id !== peers[peer.id].identity.id)
                            .filter(u => u !== null && u.id !== null);
                        peer.send(JSON.stringify({
                            sub: "data",
                            type: "initial_response",
                            data: {
                                messages: current_messages,
                                users: users
                            }
                        }));
                        break;
                    case 'message_send':
                        let {
                            content,
                            image,
                            replyTo
                        } = message.data;
                        if (!content || typeof content !== 'string' || content.length > 1999) { errors.failedparse(peer); return; }

                        if (image && !fs.existsSync(`public/images/${image}.jpg`)) {
                            errors.failedparse(peer);
                            return;
                        }
                        if (!peers[peer.id].identity) {
                            errors.permissiondenied(peer);
                            return;
                        }
                        let newmessage;
                        try {
                            // @ts-ignore
                            newmessage = (await db.insert(table).values({
                                id: crypto.randomUUID(),
                                type: 'message',
                                content,
                                image,
                                replyTo: replyTo || null,
                                username: peers[peer.id].identity.username,
                                authorId: peers[peer.id].identity.id,
                                sentByGuest: peers[peer.id].identity.isGuest
                            }).returning())[0]
                        } catch (e) {
                            console.error("Failed to insert message:", e);
                            sendPeer(peer, {
                                sub: "error",
                                type: "message_failed",
                                errors: ++peers[peer.id].errors
                            })
                            return;
                        }
                        // @ts-ignore
                        newmessage.authorImage = peers[peer.id].identity.image || `https://api.dicebear.com/5.x/initials/jpg?seed=${peers[peer.id].identity.username}`;
                        sendBroadcast(peers[peer.id].address, {
                            sub: "data",
                            type: "message_send",
                            data: newmessage
                        });
                    break;
                    case 'message_delete':
                        if (!peers[peer.id].identity) {
                            errors.permissiondenied(peer);
                            return;
                        }
                        if (!message.data || !message.data.id || typeof message.data.id !== 'string') {
                            errors.failedparse(peer);
                            return;
                        }
                        let [msgToDelete] = await db
                            .select()
                            .from(table)
                            .where(eq(table.id, message.data.id))
                            .limit(1);
                        if (!msgToDelete) {
                            errors.failedparse(peer);
                            return;
                        }
                        if (msgToDelete.authorId !== peers[peer.id].identity.id) {
                            errors.permissiondenied(peer);
                            return;
                        }
                        // @ts-ignore
                        await db.update(table).set({deleted: true}).where(eq(table.id, message.data.id));
                        sendBroadcast(peers[peer.id].address, {
                            sub: "data",
                            type: "message_delete",
                            data: {id: message.data.id}
                        });
                        break;
                }
                break;
            default:
                errors.failedparse(peer);
                break;
        }
    },
    async close(peer: Peer, event: any) {
        if (peers[peer.id]) {
            console.log(`${peer.id.slice(0, 8)} <= ${peers[peer.id].address}`);
            sendBroadcast(peers[peer.id].address, {
                sub: "data",
                type: "user_left",
                data: { user: peers[peer.id].identity }
            })
            killPeer(peer);
            delete peers[peer.id];
        } else {
            console.warn(`Peer ${peer.id} disconnected but was not found in peers. were we hacked again jim`);
        }
    },
}

const sendPeer = (peer: Peer, data: any) => void(peer.send(JSON.stringify(data)));
const killPeer = (peer: Peer) => {
    if (peers[peer.id]) {
        try {clearTimeout(peers[peer.id].verify[2])} catch {}
        try {clearInterval(peers[peer.id].verify[3])} catch {}
        try {clearTimeout(peers[peer.id].ping[2])} catch {}
        try {clearInterval(peers[peer.id].ping[3])} catch {}
    }
    try {peer.close(3008)} catch {}
}
const getPeerAddress = (peer: Peer) => {
    let url = peer.request.url;
    return url.split('/')[3];
}
const sendBroadcast = (address: string, data: any, self: string = null) => {
    for (let peerId in peers) {
        if (peers[peerId].address === address && peers[peerId].verified && (self === null || peerId !== self)) {
            sendPeer(peers[peerId].peer, data);
        }
    }
}

const verify = async (peer: Peer, message: any) => {
    let [status, party, timeout] = peers[peer.id].verify
    if (message.type === 'response') {
        if (status !== PeerStatus.stage1) {
            errors.invalidstate(peer, `Expected stage1, got ${status}`);
            return;
        }
        clearTimeout(timeout);

        let {sessionToken, isGuest} = message.data;
        if (!sessionToken || typeof sessionToken !== 'string') {
            errors.failedparse(peer);
            return;
        }
        if (isGuest !== true && isGuest !== false) {
            errors.failedparse(peer);
            return;
        }

        let sessions: { session: any; user: User; };

        if (isGuest) {
            sessions = await validateGuestSessionToken(sessionToken, true);
        } else {
            sessions = await validateSessionToken(sessionToken, true);
        }

        let {user, session} = sessions;
        if (!user || !session) {
            sendPeer(peer, {sub: "verify", type: "rejected", data: 404});
            peer.close(3000);
            killPeer(peer);
            return;
        }

        let [existingSession] = Object.values(peers).filter(p => p.identity && p.identity.id === user.id && p.peer.id !== peer.id);
        if (existingSession) {
            console.warn(`Peer ${peer.id} tried to connect with an already connected user ${user.username} (${user.id})`);
            sendPeer(existingSession.peer, {
                sub: "error",
                type: "another_session",
                errors: -1
            })
            existingSession.peer.close(3003);
        }
        peers[peer.id].identity = user;

        status = PeerStatus.idle;
        party = PeerWaiting.Server;
        timeout = null;

        sendPeer(peer, {sub: 'verify', type: 'accepted', data: {version: 1.0, ping: 30}})
        if (!peers[peer.id].broadcasted)
            sendBroadcast(peers[peer.id].address, {
                sub: "data",
                type: "user_joined",
                data: { user: peers[peer.id].identity }
            }, peer.id)

        peers[peer.id].verify = [status, party, timeout, null];
        peers[peer.id].verified = true;
    }
    else errors.failedparse(peer);
}
const ping = async (peer: Peer, message: any) => {
    if (message.type === 'ack') {
        if (peers[peer.id].ping[0] !== PeerStatus.stage1) {
            console.log("invalid state")
            errors.invalidstate(peer, `Expected stage1, got ${peers[peer.id].ping[0]}`);
            return;
        }
        clearTimeout(peers[peer.id].ping[2]);
        peers[peer.id].ping[0] = PeerStatus.idle;
        peers[peer.id].ping[1] = PeerWaiting.Server;
        peers[peer.id].ping[2] = null;
    } else {
        errors.failedparse(peer);
        return
    }
}