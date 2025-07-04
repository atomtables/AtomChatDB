<script>
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";

    let { data } = $props();

    onMount(() => {
        // Resize inputs on mount
        document.querySelectorAll('input.x1').forEach(input => {
            input.size = 8
        });
    });

    let { domain, class: class_, focus, topic } = $state({domain: '', class_: '', focus: '', topic: ''});

    function resizeInput(event) {
        const input = event.target;

        if (event.data === '.') {
            event.preventDefault();
            if (input.id === 'domain') { domain = input.value.slice(0, -1); }
            else if (input.id === 'class_') { class_ = input.value.slice(0, -1); }
            else if (input.id === 'focus') { focus = input.value.slice(0, -1); }
            else if (input.id === 'topic') { topic = input.value.slice(0, -1); }
            const nextfocus = Array.from(document.querySelectorAll("input.x1"))
            nextfocus[nextfocus.indexOf(document.activeElement) + 1].focus();
        } else if (/[^A-Za-z]/.test(event.data) || input.value.length > 16) {
            if (input.id === 'domain') { domain = input.value.slice(0, -1); }
            else if (input.id === 'class_') { class_ = input.value.slice(0, -1); }
            else if (input.id === 'focus') { focus = input.value.slice(0, -1); }
            else if (input.id === 'topic') { topic = input.value.slice(0, -1); }
            input.value = input.value.slice(0, -1);
        }

        input.size = input.value.length || 8; // prevent size=0
    }

    function goToAddress() {
        let url = "/";
        console.log(domain, class_, focus, topic)
        if (domain) {
            url += domain;
        }
        if (class_) {
            url += `.${class_}`;
        }
        if (focus) {
            url += `.${focus}`;
        }
        if (topic) {
            url += `.${topic}`;
        }
        goto(url);
    }
</script>


<div>
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
    <main class="w-screen h-screen flex flex-col items-center justify-center">
        <div class="flex flex-col items-center justify-center">
            <div class="text-center flex flex-row justify-between items-end w-max">
                <h1 class="text-4xl font-bold w-83 text-left">AtomChatDB</h1>
                <div class="w-48 text-right">by atomtables</div>
            </div>
            <div class="text-center p-2">
                A huge group of people separated by four identifiers.
            </div>

            {#if data.auth}
                <div class="flex flex-row space-x-2 backdrop-blur-3xl p-2">
                    <div>{data.user.isGuest ? 'connected' : 'logged in'} as <b>{data.user.username}</b> ({data.user.person})</div>
                    <a href="/auth/logout" class="underline block text-red-200">log out</a>
                </div>
            {:else}
                <div class="flex flex-row space-x-2 backdrop-blur-3xl p-2">
                    <a href="/auth/login" class="underline block">use an account</a>
                    or
                    <a href="/auth/asguest" class="pl-2 underline block">connect as guest</a>
                </div>
            {/if}

            <div class="flex flex-row space-x-2">
                <div class="bg-neutral-800/10 p-2 my-2 flex flex-row items-end space-x-1 h-14 backdrop-blur-3xl">
                    <input type="text" id="domain" bind:value={domain} placeholder="domain" class="x1" oninput={resizeInput} tabindex="0" size="8">
                    <div class="-mb-1.75">
                        .
                    </div>
                    <input type="text" id="class_" bind:value={class_} placeholder="class" class="x1" oninput={resizeInput} tabindex="0" size="8">
                    <div class="-mb-1.75">
                        .
                    </div>
                    <input type="text" id="focus" bind:value={focus} placeholder="focus" class="x1" oninput={resizeInput} tabindex="0" size="8">
                    <div class="-mb-1.75">
                        .
                    </div>
                    <input type="text" id="topic" bind:value={topic} placeholder="topic" class="x1" oninput={resizeInput} tabindex="0" size="8">
                </div>
                <button onclick={() => goToAddress()} class="bg-neutral-800/10 h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 my-2 cursor-pointer" title="go to address">
                    →
                </button>
                <button class="bg-neutral-800/10 h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 my-2 cursor-pointer" title="help">
                    ?
                </button>
            </div>
        </div>
    </main>
</div>
