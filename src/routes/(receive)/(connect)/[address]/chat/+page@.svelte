<script>
    import { slide } from "svelte/transition";
    import {onDestroy, onMount} from "svelte";
    import {goto} from "$app/navigation";

    let { data } = $props();

    let ws = $state();
    let state = $state({});
    let messageError = $state();
    let error = $state(null);
    let textarea = $state();

    $effect(() => {
        if (textarea) {
            this.style.height = "auto";
            textarea.style.height = (textarea.scrollHeight) + "px";
            textarea.style.overflowY = "hidden";

            textarea.addEventListener("input", function() {
                this.style.height = "auto";
                this.style.height = this.scrollHeight + "px";
            });
        }
    })

    onMount(() => {
        console.log(data.session.id);

        connect()

        return () => {
            ws.close(1000);
        }
    })

    const connect = () => {
        ws = new WebSocket(`/${data.address.address}/chat/connect`);
        ws.onopen = () => {
            state = {state: "connected to server, waiting for auth"}
            console.log("WebSocket connection established");
        };
        ws.onmessage = ({data: d}) => {
            let msg = JSON.parse(d);
            if (msg.sub === 'verify') {
                if (msg.type === 'request') {
                    state.state = "authenticating"
                    ws.send(JSON.stringify({
                        sub: 'verify',
                        type: 'response',
                        data: {
                            sessionToken: data.session?.id,
                            isGuest: data.user?.isGuest
                        }
                    }));
                } else if (msg.type === 'accepted') {
                    state.state = "authenticated, waiting for data"
                    state.connected = true;
                    if (!state.initial) {
                        ws.send(JSON.stringify({
                            sub: 'data',
                            type: 'initial_request'
                        }))
                    }
                } else if (msg.type === 'rejected') {
                    error = "Failed to connect due to an authentication issue. Please try later, or re-log back in."
                    ws.close(3003);
                }
            }
            if (msg.sub === 'ping') {
                ws.send(JSON.stringify({sub: 'ping', type: 'ack'}));
            }
            if (msg.sub === 'data') {
                switch (msg.type) {
                    case "initial_response":
                        state.initial = true;
                        state.messages = msg.data.messages;
                        state.users = msg.data.users;
                        break;
                    case "user_joined":
                        let users = [...(state.users ?? []), msg.data.user];
                        users.sort()
                        state.users = users;
                        break;
                    case "user_left":
                        state.users = (state.users ?? []).filter(u => u.username !== msg.data.user.username);
                        break;
                    case "message_send":
                        state.messages = [msg.data, ...(state.messages || [])];
                        break;
                    case "message_delete":
                        state.messages = (state.messages || []).map(m => {
                            if (m.id === msg.data.id) {
                                m.deleted = true
                            }
                            return m;
                        });
                        break;
                }
            }
            if (msg.sub === 'error') {
                if (msg.type === 'another_session')
                    error = "You have been disconnected because you logged in from another device or browser. Please refresh the page to reconnect.";
                else if (msg.type === 'internal')
                    error = "An internal error occurred. Please try again later.";
                else if (msg.type === 'message_error') {
                    messageError = "A server error occurred while sending your message. Please try again later.";
                }
                else {
                    console.log("Unknown error type:", msg.type, msg.data);
                    alert("A " + msg.type + " error occurred.")
                }
            }
        };
        ws.onclose = () => {
            state.connected = false;
            if (!error) {
                setTimeout(() => {
                    connect();
                    state.state = "waiting to reconnect"
                }, 5000)
            }
        }
    }

    let toSendMessage = $state();
    let toProcessImage = $state();
    const fiximagefile = async event => {
        try {
            console.log(toProcessImage, event.target.files[0]);
            let file = event.target.files[0];
            if (!file || !file.type.startsWith('image/')) {
                toProcessImage = null;
                return;
            }
            const formdata = new FormData();
            formdata.append('image', file);
            toSendImage = await (await fetch("/parseimage", {
                method: 'POST',
                body: formdata, // Browser will automatically set the correct Content-Type with boundary
                duplex: 'half'
            })).text();
            console.log(toSendImage);
        } catch (e) {
            console.error("Failed to process image:", e);
            alert(`Failed to process image. ${e.message}`);
            toProcessImage = null;
            toSendImage = null;
        }
    }
    let toSendImage = $state();
    let toSendReply = $state();
    const sendMessage = async () => {
        await new Promise(resolve => {
            setInterval(() => {
                if (!toProcessImage || toSendImage) {
                    resolve();
                }
            }, 100);
        })
        await ws.send(JSON.stringify({
            sub: 'data',
            type: 'message_send',
            data: {
                content: toSendMessage,
                image: toSendImage,
                replyTo: toSendReply?.id,
            }
        }));
        toSendMessage = null;
        toSendImage = null;
        toProcessImage = null;
        toSendReply = null;
    }

    const messageReferringTo = id => {
        if (!state.messages) return null;
        return state.messages.find(m => m.id === id);
    }

    const deleteMessage = async (messageId) => {
        await ws.send(JSON.stringify({
            sub: 'data',
            type: 'message_delete',
            data: {
                id: messageId
            }
        }));
    };
</script>

<svelte:window></svelte:window>

<main class="">
    <div class="flex flex-row justify-between items-center p-2 max-w-3xl mx-auto">
        <h1 class="text-4xl font-bold">AtomChatDB</h1>

        <div class="flex flex-col space-x-2 backdrop-blur-3xl p-2">
            <span>{data.address.address}</span>
            <span>{data.user.username}</span>
        </div>
    </div>
    <div class="w-11/12 mx-auto rounded-t-[75px] min-h-[calc(100vh-80px)] h-[calc(100vh-80px)] bg-neutral-500/10 backdrop-blur-md" transition:slide>
        <div class="pt-5 flex flex-col h-full">
            <div class="pt-2 pb-2 mx-[200px] flex flex-row justify-between">
                <div class="flex items-center space-x-2">
                    {#if !state.connected}
                        <span class="text-sm text-neutral-400 animate-pulse">connecting...</span>
                    {:else}
                        <span>{state?.users?.length || 0} other users</span>
                    {/if}
                </div>
                <div class="flex flex-row space-x-2">
                    <button onclick={() => { ws?.close(1000); goto('/') }} class="font-bold underline cursor-pointer">disconnect</button>
                </div>
            </div>
            <hr class="w-full mx-auto">
            <!-- actual menus -->
            {#if error}
                <div class="w-full h-full grid place-items-center">
                    {error}
                </div>
            {:else if !state.connected || !state.initial}
                <div class="w-full h-full grid place-items-center">
                    <div class="flex flex-col items-center space-y-2">
                        <h1 class="text-xl font-bold">Connecting...</h1>
                        <p class="text-sm text-neutral-400">currently at "{state.state || 'attempting connection'}".</p>
                    </div>
                </div>
            {:else}
                <div class="mx-2 flex flex-row flex-nowrap inset-0 h-[calc(100%-58px)]">
                    <div class="border-r-2 pr-2 border-neutral-500 h-full flex flex-col w-1/5 overflow-y-scroll shrink-0">
                        <button class="hover:bg-neutral-600/50 flex flex-row items-center w-full text-left p-2 font-bold">
                            <img src="/public/dp/{data.user.username}.jpg" alt="User Avatar" class="w-8 h-8 rounded-full inline-block mr-2">
                            {data.user.username}
                            {#if data.user.isGuest}
                                <span class="text-neutral-500">(guest)</span>
                            {/if}
                        </button>
                        <hr class="my-1.5">
                        {#if state.users?.length > 0}
                            {#each state.users as user, ind (user.id)}
                                <button class="hover:bg-neutral-600/50 flex flex-row items-center w-full text-left p-2 font-bold">
                                    <img src="/public/dp/{user.username}.jpg" alt="User Avatar" class="w-8 h-8 rounded-full inline-block mr-2">
                                    {user.username}
                                    {#if user.isGuest}
                                        <span class="text-neutral-500">(guest)</span>
                                    {/if}
                                </button>
                            {/each}
                        {:else}
                            <div class="flex flex-col items-center justify-center">
                                <img src="/pressed.png" alt="No Users" class="mb-2">
                            </div>
                        {/if}
                    </div>
                    <div class="px-2 h-full flex space-y-0 flex-col grow overflow-y-scroll">
                        <div class="flex flex-col">
                            <div class="flex flex-row space-x-2">
                                <input type="text" placeholder={'"text" your friends here'}
                                          class="h-14 x1 text-left w-full" bind:value={toSendMessage}>
                                <button
                                        class="bg-neutral-800/10 transition-colors w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 cursor-pointer"
                                        title="send message" onclick={() => sendMessage()}>
                                    →
                                </button>
                                <!--                            <button class="bg-neutral-800/10 h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 cursor-pointer"-->
                                <!--                                    title="upload an image">-->
                                <!--                                +-->
                                <!--                            </button>-->
                                <div class="flex items-centerbg-neutral-800/10 h-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 cursor-pointer">
                                    <label for="fileInput" class="flex flex-row items-center">
                                        <span>+</span> <span>{toSendImage ? 'uploaded' : toProcessImage ? 'uploading' : 'image'}</span>
                                    </label>
                                    <input bind:value={toProcessImage} onchange={fiximagefile} id="fileInput" type="file" class="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            </div>
                            {#if toSendReply}
                                <div class="text-neutral-300 text-sm ml-2 truncate hover:underline">
                                    ↪ replying to <b>{toSendReply.username}</b>: {toSendReply.content.slice(0, 35)}{toSendReply.content.length > 35 ? '...' : ''}
                                </div>
                            {/if}
                            {#if messageError}
                                <div class="text-red-500 text-sm ml-2 truncate">
                                    {messageError}
                                </div>
                            {/if}
                        </div>
                        {#each state.messages as message, ind (message.id)}
                            {@const sentToday = new Date(message.createdAt).toDateString() === new Date().toDateString()}
                            {@const sameAuthor = state.messages[ind-1]?.authorId === message.authorId}
                            {@const diffDays = new Date(message.createdAt).toDateString() !== new Date(state.messages[ind - 1]?.createdAt).toDateString()}
                            {@const tenMinutes = Math.abs(new Date(message.createdAt) - new Date(state.messages[ind - 1]?.createdAt)) <= 10 * 60 * 1000}
                            {#if !message.deleted}
                                {#if (ind > 0 && diffDays) || (ind === 0 && !sentToday)}
                                    <div class="mt-2  text-center flex items-center space-x-2 px-2 before:content-[''] before:flex-[1] before:border-b-1 before:border-neutral-500 after:content-[''] after:flex-[1] after:border-b-1 after:border-neutral-500">
                                        {#if sentToday}
                                            Today
                                        {:else}
                                            {new Date(message.createdAt).toLocaleDateString()}
                                        {/if}
                                    </div>
                                {/if}
                                <div id={message.id} class="target:border-l-2 group relative flex flex-col {!(ind > 0 && sameAuthor && tenMinutes) && 'mt-2 pt-0.5'} px-2 hover:backdrop-blur-3xl">
                                    {#if !(ind > 0 && sameAuthor && tenMinutes)}
                                        <div class="flex flex-row items-center space-x-2 pb-1">
                                            <img src={`/public/dp/${message.username}.jpg`} alt="{message.username}'s avatar" class="w-8 h-8 rounded-full inline-block mr-2">
                                            <span class="font-bold">{message.username}</span>
                                        </div>
                                    {/if}
                                    <div class="flex flex-row flex-nowrap items-center">
                                        <div class="w-16 flex flex-col text-sm text-neutral-300 font-light shrink-0">
                                            {new Date(message.createdAt).toLocaleTimeString({}, {hour: "2-digit", minute: "2-digit"}).replace(/ (p|a)m/gi, '$1').toLowerCase()}
                                        </div>
                                        <div class="">
                                            <p>{message.content}</p>
                                            {#if message.image}
                                                <img src="/public/images/{message.image}.jpg" alt="Image Message" class="max-w-96 mt-2 mb-2 h-auto rounded-lg">
                                            {/if}
                                        </div>
                                    </div>
                                    {#if message.replyTo}
                                        {@const reply = messageReferringTo(message.replyTo)}
                                        {#if reply.deleted}
                                            <div class="text-neutral-300 text-sm ml-2 truncate">
                                                ↪ replied to deleted message
                                            </div>
                                        {:else if reply}
                                            <a class="text-neutral-300 text-sm ml-2 truncate hover:underline w-min" href="#{reply.id}">
                                                ↪ replying to <b>{reply.username}</b>: {reply.content.slice(0, 35)}{reply.content.length > 35 ? '...' : ''}
                                            </a>
                                        {:else}
                                            <div class="text-neutral-300 text-sm ml-2 truncate">
                                                ↪ replied to a message that has not been loaded
                                            </div>
                                        {/if}
                                    {/if}
                                    <div class="absolute right-0 top-0 px-2 bg-neutral-700 opacity-50 hover:opacity-100 transition-opacity hidden group-hover:flex flex-row space-x-2">
                                        <button class="cursor-pointer underline" onclick={() => toSendReply = message}>reply</button>
                                        {#if message.authorId === data.user.id}
                                            <button class="cursor-pointer underline text-red-500" onclick={() => deleteMessage(message.id)}>delete</button>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        {/each}
                        <div class="p-2"></div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</main>



{#snippet cutecat()}
    <div class="flex flex-row items-center space-x-5">
        <pre>


⠀⠀⡾⠻⢶⠶⣤⣄⠀⠀⠀⢀⣀⣀⡀⠀⠀⣀⣀⣀⣤⣤⣤⠤⠤⣤⣤⣤⠄⠀
⠀⠀⡇⠀⠀⠉⠢⣈⠛⠛⠛⠉⠉⠉⠉⠛⠋⠉⠉⠀⠀⢀⠠⠔⠊⢉⡼⠋⠀⠀
⠀⠀⣇⠀⠀⠀⠀⠈⠣⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠞⠁⠀⠀⣠⠟⠁⠀⠀⠀
⠀⠀⣿⠀⠀⠀⠀⠀⠀⠈⡄⠀⠀⠀⠀⠀⠀⠀⠀⡆⠀⠀⠀⠀⡏⠀⠀⠀⠀⠀
⠀⢀⡟⠢⢀⡀⠀⠀⣀⠠⠓⠀⠀⠀⠀⠀⠀⠀⠀⠈⢆⡀⠀⢀⡇⠀⠀⠀⠀⠀
⠀⡾⠀⠀⠀⠈⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣶⠞⠁⠀⠀⠀⠀⠀
⢸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀
⣾⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀⠀⠀⠀⠀⠀⠀
⣷⠀⠀⠀⠀⠀⠀⠈⢫⠋⣿⡖⢦⠀⠀⠀⢀⡴⣿⢙⡏⢉⡏⠀⠀⠀⠀⠀⠀⠀
⠘⢷⠀⠀⠀⠀⠀⠀⠀⠑⠂⠀⠓⢣⠀⠀⡞⠓⠚⠊⠀⠈⠙⢦⡀⠀⠀⠀⠀⠀
⠀⢸⡇⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠘⡄⢀⠇⠀⢀⠔⠁⠀⠀⠀⠙⢦⡀⠀⠀⠀
⠀⠀⡇⠀⠀⠀⠑⠤⡀⠀⠀⠀⠀⠀⣗⡜⠀⡠⠃⠀⠀⠀⠀⠀⠀⠈⠻⣄⠀⠀
⠀⠀⡇⠀⠀⠀⠀⠀⠈⠐⠤⢀⣀⣉⣉⠦⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣆⠀
⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⢹⡄
⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡄⠀⠀⢷
⠀⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⢸
⠀⠀⢻⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠃⠀⠀⢸
⠀⠀⠸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠀⠀⠀⢠
⠀⠀⠀⢻⡀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⢸
⠀⠀⠀⠘⣧⠀⠀⠀⠘⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠀⠀⠀⠀⣸
⠀⠀⠀⠀⢹⡀⠀⠀⠀⠘⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡎⠀⠀⠀⢠⡏
⠀⠀⠀⠀⠸⡇⠀⠀⠀⠀⠀⢱⡦⣤⣀⣀⣠⣤⡀⠀⠀⠀⠀⠀⠇⠀⠀⠀⣾⠁
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠘⡇⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⣼⠃⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⢀⡾⠁⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⢸⠇⠀⠀⠀⠀⠀⡴⠋⠀⠀⠀⠀
⠀⠀⠀⠀⣾⠋⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⢠⡟⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣀⡆⠀⠀⠀⠀⢀⡟⠀⠀⠀⠸⣆⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠙⣧⣀⣾⣤⡤⠞⠁⠀⠀⠀⠀⠙⣦⣄⣰⣧⣬⣿⠟⠀⠀⠀⠀⠀
                            </pre>
        <div>
            <h1 class="text-xl font-bold">no posts...</h1>
            <div>why don't you get something started?</div>
            <div>create a post (button on the top right)</div>
        </div>
    </div>
{/snippet}