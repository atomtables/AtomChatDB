<script>
    let { post, address } = $props();

    let x = $derived(post.createdAt.toLocaleString())
    let y = $derived(post.createdAt)
</script>

{@debug x, y}

<div class="flex flex-col p-2 bg-neutral-500/20">
    <div class="w-ful p-2 border-b-2 border-neutral-500">
        <span class="">
            From: <b>{post.username} {post.sentByGuest ? '(guest)' : ''}</b> on {new Date(post.createdAt).toLocaleString()}
        </span>
    </div>
    <div class="w-full px-2 py-2 border-b-2 border-neutral-500">
        To: <b>{address}</b>
    </div>
    <div class="flex flex-row space-x-2 w-full px-2 py-2 border-b-2 border-neutral-500">
        <span class="font-bold">{post.title}</span>
    </div>
    <div class="flex flex-col w-full h-full px-2 py-2">
        {#if post.image}
            <img src={post.image} alt="Post image" class="max-w-full max-h-96 object-contain mt-2" />
        {/if}
        <pre class="whitespace pre-wrap break-words">{@html post.content}</pre>
    </div>
</div>