<script>
    import DoubleButton from "$lib/DoubleButton.svelte";

    let { deletePost, post, address, user } = $props();

    let x = $derived(post.createdAt.toLocaleString())
    let y = $derived(post.createdAt)
</script>

{@debug x, y}

<div class="flex flex-col p-2 bg-neutral-500/20 {post.deleted && 'bg-red-900/20'}">
    <div class="w-ful p-2 border-b-2 border-neutral-500">
        <span class="flex flex-row items-center space-x-2">
            From:
            <img src="/public/dp/{post.username}.jpg" alt="author image" class="w-8 h-8 ml-2 rounded-full hover:bg-blend-darken">
            {@html post.deleted ? '<i>[redacted]</i>' : `<b>${post.username} ${post.sentByGuest ? '(guest)' : ''}</b>`}
            <span>on {new Date(post.createdAt).toLocaleString()}</span>
        </span>
    </div>
    <div class="w-full px-2 py-2 border-b-2 border-neutral-500">
        To: <b>{address}</b>
    </div>
    <div class="flex flex-row space-x-2 w-full px-2 py-2 border-b-2 border-neutral-500">
        <span class="font-bold">{post.title}</span>
    </div>
    <div class="flex flex-col w-full h-full items-start px-2 py-2 border-b-2 text-left border-neutral-500">
        {#if post.deleted}
            <i>This post has been deleted</i>
        {:else}
            {#if post.image}
                <img src={`/public/images/${post.image}.jpg`} alt="Post image" class="max-h-96 object-contain my-2" />
            {/if}
            <pre class="whitespace-break-spaces pre-wrap break-words">{@html post.content}</pre>
        {/if}
    </div>
    {#if post.authorId === user.id && !user.isGuest && !post.deleted}
        <div class="flex flex-row pt-2 self-end">
            <DoubleButton type="submit" onclick={() => deletePost(post)}
                    class="p-2 cursor-pointer text-red-500 hover:bg-neutral-500/50 active:bg-neutral-600/50 shrink">
                delete
            </DoubleButton>
        </div>
    {/if}
</div>