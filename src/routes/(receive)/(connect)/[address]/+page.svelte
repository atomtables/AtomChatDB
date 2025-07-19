<script>
    import Dialog from "$lib/Dialog.svelte";
    import {onMount} from "svelte";
    import {afterNavigate, goto, invalidate} from "$app/navigation";
    import {quadInOut} from "svelte/easing";
    import {fade} from "svelte/transition";
    import {enhance} from "$app/forms";
    import {alert} from "$lib/Dialog.svelte";

    let {data, form} = $props();
    let openForm = $state(false);

    onMount(() => {
        invalidate("layout:cooked")
    })

</script>

<div class="p-2 backdrop-blur-3xl bg-neutral-500/5 text-sm">
    {#if data.address}
        <div class="flex flex-col items-center">
            <div class="flex flex-row justify-center items-center space-x-2">
                <span><b>{data.address.type === 'news' ? 'newsgroup' : 'chatroom' }</b> created by <b>{data.address.createdBy}</b> on {data.address.createdAt.toLocaleDateString()}</span>
            </div>
            <span class="max-w-xl max-h-48 overflow-y-scroll text-center"><i>Description:</i> {data.address.description}</span>
        </div>
    {:else}
        <div class="flex flex-col">
            <div class="flex flex-row justify-center items-center space-x-2">
                <span>404 address not found</span>
                <button class="cursor-pointer disabled:cursor-not-allowed disabled:text-neutral-500 font-bold p-1 border-2 border-neutral-500"
                        disabled={data.user?.isGuest} onclick={() => openForm = true}>request creation
                </button>
            </div>
            <div class="text-center text-sm max-w-xl pt-2">
                proposals for new addresses can be filed using the <i>request creation</i> button or can be
                sent at the
                address news.groups.proposals. you can check on the progress of your proposal at
                news.groups.proposals.
            </div>
        </div>
    {/if}
</div>

{#if openForm}
    <form method="POST" action="?/createProposal" use:enhance={({form}) => {
        return async ({result, error}) => {
            if (result.type === 'success') {
                openForm = false;
                await alert(
                    "Submit an address creation request",
                    "your request has been submitted, you can check the status at news.groups.proposals"
                )
            } else {
                console.error(result);
            }
        }
    }}>
        <div>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50"
                 transition:fade={{ delay: 50, duration: 150, easing: quadInOut }}>
                <div
                        class="bg-neutral-800 shadow-xl w-full min-w-md max-w-2xl mx-4"
                        role="dialog"
                        aria-modal="true"
                        transition:fade={{ duration: 150, easing: quadInOut }}
                >
                    <div class="px-6 pt-5">
                        <h2 class="text-2xl font-bold">Submit an address creation request</h2>
                        <h5 class="pt-0 font-semibold">creating address <i>{data.slugs.address}</i> (after submitting go to news.groups.proposals to see the status of your proposal)</h5>
                    </div>

                    <div class="px-6 py-2">
                        <div class="flex flex-col">
                            type of group:
                            <select name="type" class="x1 border-2 border-neutral-500 my-2">
                                <option value="news">newsgroup</option>
                                <option value="chat">chatroom</option>
                            </select>
                            description of address: (max 1000 chars)
                            <textarea name="description" class="border-2 border-neutral-500 my-2" rows="4" maxlength="1000"/>
                            why this address should be added: (max 1000 chars)
                            <textarea name="whyShould" class="border-2 border-neutral-500 mt-2" rows="4" maxlength="1000"/>
                        </div>
                        <div class="text-red-500 pt-2">
                            {form?.message}
                        </div>
                    </div>

                    <div class="px-6 pb-4 pt-4 flex justify-end gap-2">
                        <button
                                class="border-2 border-neutral-500 cursor-pointer px-4 py-2 text-white bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500"
                                onclick={() => {}}
                                type="submit">
                            submit
                        </button>
                        <button
                                class="cursor-pointer px-4 py-2 text-white bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500"
                                onclick={() => openForm = false}>
                            close
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </form>
{/if}