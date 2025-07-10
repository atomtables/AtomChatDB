<script>
    import { slide } from "svelte/transition";
    import {onMount} from "svelte";
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
    })
</script>

<svelte:window></svelte:window>

<div >
    <div class="absolute inset-0 -z-50 bg-[#242424]">
        <div class="absolute inset-0 bg-[url('/background/wave8.svg')] bg-cover bg-center wave-animation [animation-duration:6s] -z-42"></div>
        <div class="absolute inset-0 bg-[url('/background/wave7.svg')] bg-cover bg-center wave-animation [animation-duration:9s] -z-43"></div>
        <div class="absolute inset-0 bg-[url('/background/wave6.svg')] bg-cover bg-center wave-animation [animation-duration:12s] -z-44"></div>
        <div class="absolute inset-0 bg-[url('/background/wave5.svg')] bg-cover bg-center wave-animation [animation-duration:15s] -z-45"></div>
        <div class="absolute inset-0 bg-[url('/background/wave4.svg')] bg-cover bg-center wave-animation [animation-duration:18s] -z-46"></div>
        <div class="absolute inset-0 bg-[url('/background/wave3.svg')] bg-cover bg-center wave-animation [animation-duration:21s] -z-47"></div>
        <div class="absolute inset-0 bg-[url('/background/wave2.svg')] bg-cover bg-center wave-animation [animation-duration:24s] -z-48"></div>
        <div class="absolute inset-0 bg-[url('/background/wave1.svg')] bg-cover bg-center wave-animation [animation-duration:27s] -z-49"></div>
    </div>
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
                                <span>{state?.users?.length || 0} users</span>
                            {/if}
                        </div>
                        <div class="flex flex-row space-x-2">
                            <button onclick={() => { ws?.close(1000); goto('/') }} class="font-bold underline cursor-pointer">disconnect</button>
                        </div>
                    </div>
                    <hr class="w-full mx-auto">
                    <!-- actual menus -->
                    <div class="mx-2 flex flex-col inset-0 h-[calc(100%-58px)]">
                        {#if state.users}
                            {state.users.map(u => u.username)}
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </main>
</div>

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