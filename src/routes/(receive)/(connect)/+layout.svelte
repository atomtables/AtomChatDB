<script>
    import {onMount} from "svelte";
    import {afterNavigate, goto, invalidate} from "$app/navigation";

    let { data, children } = $props();

    onMount(() => {
        // Resize inputs on mount
        document.querySelectorAll('input.x1').forEach(input => {
            input.size = 8
        });
    });

    let {domain, class: class_, focus, topic} = $state({
        domain: data.slugs?.domain || '',
        class: data.slugs?.class || '',
        focus: data.slugs?.focus || '',
        topic: data.slugs?.topic || ''
    });

    let everythingIsValid = $derived(
        (data.slugs?.domain ?? '') === domain &&
        (data.slugs?.class ?? '') === class_ &&
        (data.slugs?.focus ?? '') === focus &&
        (data.slugs?.topic ?? '') === topic &&
        (data.slugs?.domain ?? '') !== ''
    );

    function resizeInput(event) {
        const input = event.target;

        if (/[^A-Za-z]/.test(event.data) || input.value.length > 16) {
            if (input.id === 'domain') { domain = input.value.slice(0, -1); }
            else if (input.id === 'class_') { class_ = input.value.slice(0, -1); }
            else if (input.id === 'focus') { focus = input.value.slice(0, -1); }
            else if (input.id === 'topic') { topic = input.value.slice(0, -1); }
            input.value = input.value.slice(0, -1);
            if (event.data === '.') {
                const nextfocus = Array.from(document.querySelectorAll("input.x1"))
                nextfocus[nextfocus.indexOf(document.activeElement) + 1].focus();
                nextfocus[nextfocus.indexOf(document.activeElement)].select();
            }
        }

        console.log()

        input.size = input.value.length || 8; // prevent size=0
    }

    afterNavigate(() => {
        invalidate("layout:cooked")
        domain = data.slugs?.domain || '';
        class_ = data.slugs?.class || '';
        focus = data.slugs?.focus || '';
        topic = data.slugs?.topic || '';
        setTimeout(() => {
            document.querySelectorAll('input.x1').forEach(input => {
                input.size = input.value.length || 8; // prevent size=0
            });
        }, 20)
    })

    async function goToAddress() {
        let url = "/";
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

        await goto(url);
    }

    async function goAllTheWay() {
        let url = "/";
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
        url += `/${data.address.type}`
        await goto(url);
    }
</script>


{#if data.auth}
    <div class="flex flex-row space-x-2 backdrop-blur-sm p-2">
        <div class="flex flex-row items-center">{data.user.isGuest ? 'connected' : 'logged in'} as
            <img
                    src="/public/dp/{data.user.username}.jpg"
                    alt="user image"
                    class="w-8 h-8 ml-2 rounded-full hover:bg-blend-darken"
            >
            <b class="mx-2">{data.user.username}</b>
            ({data.user.person})
            <a href="/auth/logout" class="underline block text-red-200 mx-2">log out</a>
        </div>

    </div>
{:else}
    <div class="flex flex-row space-x-2 backdrop-blur-sm p-2">
        <a href="/auth/login" class="underline block">use an account</a>
        or
        <a href="/auth/asguest" class="pl-2 underline block">connect as guest</a>
    </div>
{/if}

<div class="flex flex-row space-x-2">
    <div class="bg-neutral-800/10 p-2 my-2 flex flex-row items-end space-x-1 h-14 backdrop-blur-3xl">
        <input type="text" bind:value={domain} id="domain" placeholder="domain" class="x1" oninput={resizeInput}
               tabindex="0" size="8">
        <div class="-mb-1.75">
            .
        </div>
        <input type="text" bind:value={class_} id="class_" placeholder="class" class="x1" oninput={resizeInput}
               tabindex="0" size="8">
        <div class="-mb-1.75">
            .
        </div>
        <input type="text" bind:value={focus} id="focus" placeholder="focus" class="x1" oninput={resizeInput}
               tabindex="0" size="8">
        <div class="-mb-1.75">
            .
        </div>
        <input type="text" bind:value={topic} id="topic" placeholder="topic" class="x1" oninput={resizeInput}
               tabindex="0" size="8">
    </div>
    <button onclick={() => everythingIsValid && data.address ? goAllTheWay() : goToAddress()}
            class="block bg-neutral-800/10 transition-colors {everythingIsValid && '!bg-green-700'} h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 my-2 cursor-pointer"
            title="go to address">
        →
    </button>
    <a class="bg-neutral-800/10 h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 my-2 cursor-pointer flex flex-row items-center justify-center"
            title="help" href="/help">
        ?
    </a>
</div>
{#if everythingIsValid && data.address}
    <div class="text-sm animate-pulse">click again to connect</div>
{/if}
{@render children()}