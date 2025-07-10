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
    <div class="flex flex-col items-center space-y-2 p-2 my-2 backdrop-blur-3xl bg-neutral-200/5">
        <div class="flex flex-col justify-center">
            <div class="pr-2 flex flex-row space-x-2 h-14 justify-center">
                <select class="x1 h-14 backdrop-blur-3xl border-b-2 border-neutral-500" bind:value={optionValue}
                        name="email" aria-roledescription="choose if you are logging in with email or phone number">
                    <option>e-mail</option>
                    <option>phone#</option>
                </select>
                <input
                        type="{optionValue === 'e-mail' ? 'email' : 'text'}"
                        name="personalIdentifier"
                        placeholder="{optionValue === 'e-mail' ? 'user@web.com' : '+13115552368'}"
                        class="x1 h-14"
                        oninput={resizeInput}
                        tabindex="0"
                        size="12"
                        autocomplete="username"
                        aria-roledescription="enter the identifier you use to log in, either your email or phone number."
                />
                <input
                        name="password"
                        type="password"
                        placeholder="password"
                        class="x1 h-14"
                        oninput={resizeInput}
                        tabindex="0"
                        size="12"
                        autocomplete="new-password"
                />
            </div>
            <div class="mt-2 pr-2 flex flex-row space-x-2 h-14 justify-center">
                <div class="flex flex-row items-center">
                    <div class="appearance-none x1 h-14 pt-4.25 pr-0">
                        DOB:
                    </div>
                    <input
                            type="date"
                            id="birth"
                            name="birth"
                            placeholder="2011-01-01"
                            class="x1 h-14 pt-3 text-base"
                            oninput={resizeInput}
                            tabindex="0"
                            aria-roledescription="your date of birth."
                    />
                </div>
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
        </div>
        <button
                class="backdrop-blur-3xl h-14 w-min bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 p-2 cursor-pointer bold"
                title="go to address"
                type="submit"
        >
            register
        </button>
    </div>
</form>
{#if form?.message}
    <div class="text-red-500 mt-2 max-w-xl text-center font-light inline">
        {form.message}
    </div>
{/if}
<div class="mt-2 max-w-xl text-center font-light text-sm">
    You use your identifier (e-mail/phone#) to log in. Your username is displayed publicly. Your personal info will never
    be shared with anyone.
</div>
<div class="mt-2 max-w-xl text-center font-light text-sm">
    We ask for information such as your date of birth and email/phone number to prevent spam and ensure the safety
    of all users of this website.
</div>
<div class="mt-2">
    <a href="/" class="inline underline">&lt; back</a>

    <a href="/auth/login" class="inline underline">login &gt;</a>
</div>
