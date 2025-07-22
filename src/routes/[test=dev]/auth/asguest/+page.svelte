<script>
    import { onMount } from "svelte";
    import { enhance } from "$app/forms";

    let { form } = $props()

    onMount(() => {
        // Resize inputs on mount
        document.querySelectorAll("input.x1").forEach((input) => {
            input.size = 12;
        });
    });

    function resizeInput(event) {
        const input = event.target;
        input.size = input.value.length > 12 ? input.value.length : 12 || 12; // prevent size=0
    }

    let optionValue = $state();
</script>

<form method="POST" use:enhance>
    <div class="flex flex-row items-center space-x-2 p-2 my-2 backdrop-blur-3xl bg-neutral-200/5">
        <div class="flex flex-col justify-center">
            <input
                    name="username"
                    type="text"
                    placeholder="username"
                    class="x1 h-14"
                    oninput={resizeInput}
                    tabindex="0"
                    size="12"
                    autocomplete="off"
            />
        </div>
        <button
                class="backdrop-blur-3xl h-14 w-min bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 p-2 cursor-pointer bold"
                title="go to address"
                type="submit"
        >
            connect
        </button>
    </div>
</form>
{#if form?.message}
    <div class="text-red-500 mt-2 max-w-xl text-center font-light inline">
        {form.message}
    </div>
{/if}
<div class="mt-2 max-w-xl text-center font-light text-sm">
    You may only log in one guest account per IP address (network). Your IP address is stored
    when you connect as a guest, but is not shared with any party. Guest connections will allow
    your chosen username to work for 24 hours unless an account with the same username is created.
</div>
<div class="mt-2 max-w-xl text-center font-light text-sm">
    Please remind yourself with the Terms of Service and the Privacy Policy for this application.
</div>
<div class="mt-2">
    <a href="/" class="inline underline">&lt; back</a>

    <a href="/[test=dev]/auth/login" class="inline underline">login &gt;</a>
</div>
