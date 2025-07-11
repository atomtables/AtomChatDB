<script>
    import { slide } from "svelte/transition";
    import {onDestroy, onMount} from "svelte";
    import {goto} from "$app/navigation";

    let { data } = $props();

    let ws = $state();
    let state = $state({});
    let error = $state(null);

    onMount(() => {
        console.log(data.session.id);
        ws = new WebSocket(`/${data.address.address}/chat/connect`);
        ws.onopen = () => {
            state = {}
            console.log("WebSocket connection established");
        };
        ws.onmessage = ({data: d}) => {
            let msg = JSON.parse(d);
            if (msg.sub === 'verify') {
                if (msg.type === 'request') {
                    ws.send(JSON.stringify({
                        sub: 'verify',
                        type: 'response',
                        data: {
                            sessionToken: data.session?.id,
                            isGuest: data.user?.isGuest
                        }
                    }));
                } else if (msg.type === 'accepted') {
                    if (!state.initial) {
                        ws.send(JSON.stringify({
                            sub: 'data',
                            type: 'initial_request'
                        }))
                        state.initial = true;
                    }
                    state.connected = true;
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
                }
            }
        };
        ws.onclose = () => {
            state.connected = false;
        }

        return () => {
            ws.close(1000);
        }
    })

    let users = $derived(state.users || [])

    let toSendMessage = $state();
    const sendMessage = async () => {
        await ws.send(JSON.stringify({
            sub: 'data',
            type: 'message_send',
            data: {
                content: toSendMessage,
                image: null,
                replyTo: null,
            }
        }));
    }
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
        {#if error}
            <div class="w-full h-full grid place-items-center">
                {error}
            </div>
        {:else}
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
                <div class="mx-2 flex flex-row flex-nowrap inset-0 h-[calc(100%-58px)]">
                    <div class="border-r-2 pr-2 border-neutral-500 h-full flex flex-col w-1/5 overflow-y-scroll">
                        <button class="hover:bg-neutral-600/50 flex flex-row items-center w-full text-left p-2 font-bold">
                            {#if data.user.image}
                                <img src={data.user.image} alt="User Avatar" class="w-8 h-8 rounded-full inline-block mr-2">
                            {:else}
                                <span class="inline-block w-8 h-8 rounded-full bg-neutral-600 mr-2"></span>
                            {/if}
                            {data.user.username}
                            {#if data.user.isGuest}
                                <span class="text-neutral-500">(guest)</span>
                            {/if}
                        </button>
                        <hr class="my-1.5">
                        {#if state.users?.length > 0}
                            {#each state.users as user, ind (user.id)}
                                <button class="hover:bg-neutral-600/50 flex flex-row items-center w-full text-left p-2 font-bold">
                                    {#if user.image}
                                        <img src={user.image} alt="User Avatar" class="w-8 h-8 rounded-full inline-block mr-2">
                                    {:else}
                                        <span class="inline-block w-8 h-8 rounded-full bg-neutral-600 mr-2"></span>
                                    {/if}
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
                    <div class="px-2 h-full flex flex-col grow overflow-y-scroll">
                        <div class="flex flex-row space-x-2">
                            <input type="text" placeholder={'"text" your friends here'}
                                   class="h-14 x1 text-left w-full" bind:value={toSendMessage}>
                            <button
                                    class="bg-neutral-800/10 transition-colors h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 cursor-pointer"
                                    title="send message" onclick={() => sendMessage()}>
                                →
                            </button>
                            <button class="bg-neutral-800/10 h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 cursor-pointer"
                                    title="upload an image">
                                +
                            </button>
                        </div>
                        {#each state.messages as message, ind (message.id)}
                            <div class="flex flex-col my-2">
                                <div class="flex flex-row items-center space-x-2">
                                    <span class="font-bold">{message.username}</span>
                                </div>
                                <div class="ml-10 mt-1">
                                    <p>{message.content}</p>
                                    {#if message.image}
                                        <img src={message.image} alt="Image Message" class="max-w-full h-auto rounded-lg">
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
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