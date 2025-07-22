<script>
    import {onMount} from "svelte";
    import {enhance} from "$app/forms";

    let { form, draft = $bindable(), address, discard, currentlySelected = $bindable(), submit, isLoadingData } = $props();

    let textarea;
    onMount(() => {
        textarea.style.height = textarea.scrollHeight + "px";
        textarea.style.overflowY = "hidden";

        textarea.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = this.scrollHeight + "px";
        });
    })
    $effect(() => {
        if (form?.message === 'Post not found') {
            submit();
        }
    })
</script>



<form class="flex flex-col p-2 bg-neutral-500/20" method="POST" action="?/replyPost" enctype="multipart/form-data" use:enhance>
    <div class="px-2 text-sm text-neutral-400">leaving this post will discard your draft.</div>
    <div class="w-full px-2 py-2 border-b-2 border-neutral-500">
        To: <b>{address}</b>
    </div>
    <input type="hidden" name="postId" value={draft.replyTo}>
    <div class="flex flex-row space-x-2 w-full px-2 py-2 border-b-2 border-neutral-500">
        <label for="title">Title: </label>
        <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="subject"
                bind:value={draft.title}
                class="border-b-1 border-neutral-500 w-full field-sizing-[normal]"
        >
    </div>
    <div class="flex flex-row space-x-2 w-full px-2 py-2 border-b-2 border-neutral-500">
        <label for="title">Image (optional): </label>
        <input type="file" name="image" accept="image/*"
               class="file:bg-neutral-500 file:cursor-pointer file:px-1"/>
    </div>
    <div class="flex flex-col w-full h-full px-2 py-2">
        <textarea
                id="content"
                required
                name="content"
                placeholder="write your post here..."
                bind:this={textarea}
                bind:value={draft.content}
                class="h-full border-b-1 border-neutral-500 w-full resize-none"
        ></textarea>
    </div>
    <div class="flex flex-row border-t-2 border-neutral-500 pt-2">
        <button onclick={() => discard(draft)}
                class="mb-2 p-2 cursor-pointer hover:bg-neutral-500/50 active:bg-neutral-600/50 shrink">
            delete
        </button>
        <button
                class="mb-2 p-2 cursor-pointer border-2 border-neutral-500 hover:bg-neutral-500/50 active:bg-neutral-600/50 grow"
                type="submit"
                onclick={async () => {
                    await isLoadingData();
                    if (!(form?.message)) submit()
                }}
        >
            submit
        </button>
    </div>
    <div class="text-red border-t-2 border-neutral-500">
        {#if form?.message}
            <div class="text-red-500 text-center inline p-2">
                {form.message}
            </div>
        {/if}
    </div>
</form>