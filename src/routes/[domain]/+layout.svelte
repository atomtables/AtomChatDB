<script>
    import {onMount} from "svelte";

    let { data } = $props();

    onMount(() => {
        // Resize inputs on mount
        document.querySelectorAll('input.x1').forEach(input => {
            input.size = input.value.length || 8; // prevent size=0
        });
    });

    function resizeInput(event) {
        const input = event.target;

        if (event.data === '.') {
            event.preventDefault();
            input.value = input.value.slice(0, -1);
            const nextfocus = Array.from(document.querySelectorAll("input.x1"))
            nextfocus[nextfocus.indexOf(document.activeElement) + 1].focus();
        }

        if (/[^A-Za-z]/.test(event.data)) {
            input.value = input.value.slice(0, -1);
        }

        input.size = input.value.length || 8; // prevent size=0
    }
</script>

<div class="flex flex-row space-x-2">
    <div class="bg-neutral-800/10 p-2 my-2 flex flex-row items-end space-x-1 h-14 backdrop-blur-3xl">
        <input type="text" value="{data?.slugs?.domain ?? ''}" placeholder="domain" class="x1" oninput={resizeInput} tabindex="0" size="8">
        <div class="-mb-1.75">
            .
        </div>
        <input type="text" value="{data?.slugs?.class ?? ''}" placeholder="class" class="x1" oninput={resizeInput} tabindex="0" size="8">
        <div class="-mb-1.75">
            .
        </div>
        <input type="text" value="{data?.slugs?.focus ?? ''}" placeholder="focus" class="x1" oninput={resizeInput} tabindex="0" size="8">
        <div class="-mb-1.75">
            .
        </div>
        <input type="text" value="{data?.slugs?.topic ?? ''}" placeholder="topic" class="x1" oninput={resizeInput} tabindex="0" size="8">
    </div>
    <button class="bg-neutral-800/10 h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 my-2 cursor-pointer" title="go to address">
        →
    </button>
    <button class="bg-neutral-800/10 h-14 w-14 backdrop-blur-3xl hover:bg-neutral-700 active:bg-neutral-600 p-2 my-2 cursor-pointer" title="help">
        ?
    </button>
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