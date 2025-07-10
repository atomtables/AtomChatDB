import { error } from "@sveltejs/kit";
import { type RequestEvent, type Peer } from "@sveltejs/kit";
import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.js";
import {desc, eq} from "drizzle-orm";
import {validateGuestSessionToken, validateSessionToken} from "$lib/server/auth.js";
import {chatroomAddress} from "$lib/server/db/index.js";
import {getPeers} from "$app/server";
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
    image?: string
}
type PeerProperty = [PeerStatus, PeerWaiting, Timeout | null, Interval | null]
interface PeerData {
    ping: PeerProperty,
    verify: PeerProperty,
    errors: number,
    identity: User,
    peer: Peer,
    broadcasted: boolean
}

let peers: {
    [peer: string]: PeerData
} = {};

const errors = {
    failedparse(peer: Peer) {peer.send(JSON.stringify({sub: "error", type: "failed_parse", errors: -1})); peer.close(3001); killPeer(peer)},
    invalidstate(peer: Peer, data: string) {peer.send(JSON.stringify({sub: "error", type: "invalid state", errors: ++peers[peer.id].errors, data}))}
}

let address: string | null;

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
        address = addr;
        let [server] = await db
            .select()
            .from(table.groups)
            .where(eq(table.groups.address, address))
            .limit(1);

        if (!server) {
            return error(404, {message: 'Address not found'});
        }
        if (server.type !== 'chat') {
            return error(404, {message: 'This address is not a chat server'});
        }
    },
    async open(peer: Peer) {
        console.log(`Peer ${peer.id} connected`);
        sendPeer(peer, {
            sub: "verify",
            type: 'request',
            timeout: 60
        })
        peers[peer.id] = {
            verify: [PeerStatus.stage1, PeerWaiting.Client, setTimeout(() => killPeer(peer), 60000), setInterval(() => {
                if (!peers[peer.id]) { clearInterval(peers[peer.id]?.verify[3]); return; }
                let [status, party, timeout] = peers[peer.id].verify;
                if (status === PeerStatus.idle && party === PeerWaiting.Server) {
                    sendPeer(peer, {sub: "verify", type: "request", timeout: 60});
                    peers[peer.id].verify = [PeerStatus.stage1, PeerWaiting.Client, setTimeout(() => killPeer(peer), 60000), peers[peer.id].verify[3]];
                }
            }, 600000)],
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
            broadcasted: false
        }
    },
    async message(peer: Peer, msg: Buffer) {
        let message: any;
        try { message = JSON.parse(msg.toString()) } catch (e) { errors.failedparse(peer); return; }

        if (message.sub === 'verify') await verify(peer, message);
        if (message.sub === 'ping') await ping(peer, message);
        if (message.sub === 'data') {
            if (message.type === 'initial_request') {
                let table = chatroomAddress(address)
                let current_messages = await db
                    .select()
                    .from(table)
                    .orderBy(desc(table.createdAt))
                    .limit(100);
                let users = Object.entries(peers)
                    .map(([_, p]) => p.identity)
                    .filter(u => u !== null)
                    .filter(u => u.id !== peers[peer.id].identity.id);
                peer.send(JSON.stringify({
                    sub: "data",
                    type: "initial_response",
                    data: {
                        messages: current_messages,
                        users: users
                    }
                }));
            }
        }
    },
    async close(peer: Peer, event: any) {
        if (peers[peer.id]) {
            console.log(`Peer ${peer.id} disconnected`);
            sendBroadcast({
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
const sendBroadcast = (data: any) => {
    for (let peerId in peers) {
        sendPeer(peers[peerId].peer, data);
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

        let [existingSession] = Object.values(peers).filter(p => p.identity && p.identity.id === user.id);
        if (existingSession) {
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
            sendBroadcast({
                sub: "data",
                type: "user_joined",
                data: { user: peers[peer.id].identity }
            })

        peers[peer.id].verify = [status, party, timeout, null];
    }
}
const ping = async (peer: Peer, message: any) => {
    if (message.type === 'ack') {
        if (peers[peer.id].ping[0] !== PeerStatus.stage1) {
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