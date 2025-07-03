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

<form method="POST">
    <div class="flex flex-row space-x-2 p-2 backdrop-blur-3xl">
        <div class="pr-2 flex flex-row space-x-2 h-14">
            <select class="x1 h-14 backdrop-blur-3xl border-b-2 border-neutral-500" bind:value={optionValue}
                    name="email" aria-roledescription="choose if you are logging in with email or phone number">
                <option>e-mail</option>
                <option>phone#</option>
            </select>
            <input
                    type="text"
                    name="personalIdentifier"
                    placeholder="{optionValue === 'e-mail' ? 'user@web.com' : '+13115552368'}"
                    class="x1 h-14 backdrop-blur-3xl"
                    oninput={resizeInput}
                    tabindex="0"
                    size="12"
                    aria-roledescription="enter the identifier you use to log in, either your email or phone number."
            />
            <input
                    name="password"
                    type="password"
                    placeholder="password"
                    class="x1 h-14 backdrop-blur-3xl"
                    oninput={resizeInput}
                    tabindex="0"
                    size="12"
                    aria-roledescription="password"
            />
        </div>
        <button
                class="backdrop-blur-3xl h-14 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 p-2 cursor-pointer bold"
                title="go to address"
                type="submit"
        >
            login
        </button>
    </div>
</form>
<div class="mt-2">
    <a href="/" class="inline underline">&lt; back</a>
    {#if form?.message}
        <div class="text-red-500 text-center  inline">
            {form.message}
        </div>
    {/if}
    <a href="/auth/register" class="inline underline">register &gt;</a>
</div>
