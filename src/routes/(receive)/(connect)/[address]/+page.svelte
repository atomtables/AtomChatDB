<script>
    import Dialog from "$lib/Dialog.svelte";
    import {onMount} from "svelte";
    import {afterNavigate, goto, invalidate} from "$app/navigation";

    let {data, form} = $props();
    let openForm = $state(false);

    onMount(() => {
        invalidate("layout:cooked")
    })

</script>

<div class="p-2">
    {#if data.address}
        <div class="flex flex-col">
            <div class="flex flex-row justify-center items-center space-x-2">
                <span><b>{data.address.type === 'news' ? 'newsgroup' : 'chatroom' }</b> created by <b>{data.address.createdBy}</b> on {data.address.createdAt.toLocaleDateString()}</span>
            </div>
            <span class="max-w-xl text-center text-sm">{data.address.description}</span>
            <button class="cursor-pointer disabled:cursor-not-allowed disabled:text-neutral-500 hover:bg-neutral-500/50 active:bg-neutral-600/50 font-bold p-1 mt-2 border-2 border-neutral-500"
                    disabled={!data.auth} onclick={() => goto(`/${data.address.address}/${data.address.type === 'news' ? 'news' : 'chat'}`)}>initiate connection {!data.auth ? '(log in first)' : ''}
            </button>
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

<Dialog open={openForm} title="Submit a domain creation request" form="?/createDomain"
        description="creating domain <i>{data.slugs.domain}</i>" actions={[
                {
                    name: "submit",
                    submit: true
                }, {
                    name: "close",
                    close: true
                }
            ]}>
    <div class="flex flex-col">
        description of address: (max 1000 chars)
        <textarea name="description" class="border-2 border-neutral-500 my-2" rows="4" maxlength="1000"/>
        why this address should be added: (max 1000 chars)
        <textarea name="whyShould" class="border-2 border-neutral-500 mt-2" rows="4" maxlength="1000"/>
    </div>
    <div class="text-red-500 pt-2">
        {form?.message}
    </div>
</Dialog>