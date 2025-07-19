<script module>
    import {createRawSnippet, mount, unmount} from "svelte";
    import Dialog from "./Dialog.svelte"

    async function never(promise) {
        let run = true;
        while (run) {
            promise.then(() => run = false);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    export const alert = async (title, description, children, manualclose) => {
        let state;
        const result = new Promise(resolve => state = resolve);
        let close;
        const manual = new Promise(resolve => close = resolve);

        let element = document.createElement("div");
        document.body.appendChild(element);

        let props = $state({
            open: false,
            title,
            description,
            actions: [{
                name: "OK",
                action: async () => {
                    await state(true);
                    if (manualclose) await never(manual);
                },
                primary: true
            }],
            children: createRawSnippet(() => ({
                render: () => children ?? "<div></div>"
            }))
        })

        const dialog = mount(Dialog, {
            target: element,
            props
        })

        props.open = true

        let value = [await result];
        if (manualclose) {
            manual.then(() => {
                props.open = false;
                setTimeout(async () => {
                    await unmount(dialog);
                    element.remove();
                }, 400)
            })
        } else {
            props.open = false;
            setTimeout(async () => {
                await unmount(dialog);
                element.remove();
            }, 400)
        }
        return value;
    }

    export const confirm = async (title, description, children, manualclose) => {
        let state;
        const result = new Promise(resolve => state = resolve);
        let close;
        const manual = new Promise(resolve => close = resolve);

        let element = document.createElement("div");
        document.body.appendChild(element);

        let props = $state({
            open: false,
            title,
            description,
            actions: [{
                name: "Cancel",
                action: async () => {
                    state(false)
                    if (manualclose) await never(manual);
                },
                close: true
            }, {
                name: "Yes",
                action: async () => {
                    state(true)
                    if (manualclose) await never(manual);
                },
                primary: true,
                close: true
            }],
            children: createRawSnippet(() => ({
                render: () => children ?? "<div></div>"
            }))
        })

        const dialog = mount(Dialog, {
            target: element,
            props
        })

        props.open = true

        let value = await result;
        if (manualclose) {
            manual.then(() => {
                props.open = false;
                setTimeout(async () => {
                    await unmount(dialog);
                    element.remove();
                }, 400)
            })
            value = [value, close]
        } else {
            props.open = false;
            setTimeout(async () => {
                await unmount(dialog);
                element.remove();
            }, 400)
            value = [value]
        }
        return value;
    }
</script>

<script>
    import {fade} from "svelte/transition";
    import {quadInOut} from "svelte/easing";
    import {enhance} from "$app/forms";

    let {open, title, description, actions, children, form} = $props();
    const closeF = () => open = false;
</script>

{#snippet action()}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50"
         transition:fade={{ delay: 50, duration: 150, easing: quadInOut }}>
        <div
                class="bg-neutral-800 shadow-xl w-full min-w-md max-w-2xl mx-4"
                role="dialog"
                aria-modal="true"
                transition:fade={{ duration: 150, easing: quadInOut }}
        >
            <div class="px-6 pt-5">
                <h2 class="text-2xl font-bold">{@html title}</h2>
                <h5 class="pt-0 font-semibold">{@html description}</h5>
            </div>

            <div class="px-6 py-2">
                {@render children?.()}
            </div>

            <div class="px-6 pb-4 pt-4 flex justify-end gap-2">
                {#each actions as {name, action, primary, close, submit}}
                    <button
                            class="{primary && 'border-2 border-neutral-500'} cursor-pointer px-4 py-2 text-white bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500"
                            onclick={!(close || submit) ? action : async () => { await action?.(); closeF(); }}
                            type="{submit ? 'submit' : 'button'}">
                        {name}
                    </button>
                {/each}
            </div>
        </div>
    </div>
{/snippet}

{#if open}
    {#if form}
        <form method="POST" action="{form}" use:enhance>
            <div>
                {@render action()}
            </div>
        </form>
    {:else}
        <div>
            {@render action()}
        </div>
    {/if}
{/if}

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fade-in 0.2s ease-out;
    }
</style>