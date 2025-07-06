<script>
    import { slide } from "svelte/transition";
    import {enhance} from "$app/forms";
    import DoubleButton from "$lib/DoubleButton.svelte";
    import PostsList from "./PostsList.svelte";
    import PostWriter from "./PostWriter.svelte";
    import PostReader from "./PostReader.svelte";
    import ReplyWriter from "./ReplyWriter.svelte";
    import {onMount} from "svelte";

    let { data, form } = $props();

    let drafts = $state([]);
    let currentlySelected = $state(null);
    let posts = $state([]);
    let isLoadingPosts = $state(true);

    $effect(async () => {
        if (data.data) {
            isLoadingPosts = true;
            try {
                posts = await data.data;
            } catch (error) {
                console.error('Error loading posts:', error);
            } finally {
                isLoadingPosts = false;
            }
        }
    });

    $effect(() => {
        if (!posts.find(p => p.id === currentlySelected) && !drafts.find(d => d.id === currentlySelected)) {
            currentlySelected = null;
        }
        if (posts.find(p => p.id === currentlySelected)) {
            loadReplies(posts.find(p => p.id === currentlySelected));
        }
    })

    const createDraft = () => {
        const newDraft = {
            id: "draft_" + crypto.randomUUID(),
            type: "post",
            title: "New Draft",
            content: "This is a new draft. Edit me!",
            username: data.user.username,
            authorId: data.user.id,
            sentByGuest: data.user.isGuest,
        };
        drafts.push(newDraft);
        currentlySelected = newDraft.id;
    }

    const getPosts = () => {
        isLoadingPosts = true;
        fetch(
            `/${data.address.address}/news/post`,
            { method: 'GET' }
        )
            .then(async response => {
                if (!response.ok) throw new Error((await response.text()));
                return response.json()
            })
            .then(data => {
                console.log(!data.posts.find(p => p.id === currentlySelected) &&
                    !drafts.find(d => d.id === currentlySelected) &&
                    posts.find(p => p.id === currentlySelected)?.replies?.find(r => r.id.startsWith("draft")))
                if (
                    !data.posts.find(p => p.id === currentlySelected) &&
                    !drafts.find(d => d.id === currentlySelected) &&
                    posts.find(p => p.id === currentlySelected)?.replies?.find(r => r.id.startsWith("draft"))
                ) {
                    if (!confirm("The post you are viewing has been deleted. Would you like to load current data, deleting your draft??")) {
                        alert("You will be asked to reconfirm in 30 seconds.")
                    } else {
                        posts = data.posts || [];
                        isLoadingPosts = false;
                        currentlySelected = null;
                    }
                } else {
                    posts = data.posts || [];
                    isLoadingPosts = false;
                }
            })
            .catch(error => {
                alert("Failed to delete post: " + error.message);
                console.error('Error fetching posts:', error);
                isLoadingPosts = false;
            }
        )
    }

    onMount(() => {
        setInterval(() => getPosts(), 30000)
    })

    const deletePost = post => {
        currentlySelected = null;
        isLoadingPosts = true;
        fetch(
            `/${data.address.address}/news/post?id=${post.id}`,
            { method: 'DELETE' }
        )
            .then(async response => {
                if (!response.ok) throw new Error((await response.text()));
                getPosts()
            })
            .catch(error => {
                alert("Failed to delete post: " + error.message);
                console.error('Error deleting post:', error);
                isLoadingPosts = false;
            })
    }
    const loadReplies = post => {
        isLoadingPosts = true;
        let ind = posts.findIndex(p => p.id === currentlySelected);
        fetch(
            `/${data.address.address}/news/replies?id=${posts[ind]?.id}`,
            { method: 'GET' }
        )
            .then(async response => {
                if (!response.ok) throw new Error((await response.text()));
                return response.json()
            })
            .then(data => {
                let test = data.replies.length;
                console.log(posts, post, posts.at(ind), data.replies, ind)
                posts[ind].replies = data.replies || [];
                isLoadingPosts = false;
            })
            .catch(error => {
                alert("Failed to delete post: " + error.message);
                console.error('Error loading replies:', error);
                isLoadingPosts = false;
            }
        )
    }

    function exitIfDraft(event) {
        if (drafts.length > 0) event.preventDefault()
        return drafts.length > 0;
    }
</script>

<svelte:window onbeforeunload={exitIfDraft}></svelte:window>

<div >
    <div class="absolute inset-0 -z-50 bg-[#242424]">
        <div class="absolute inset-0 bg-[url('/background/wave8.svg')] bg-cover bg-center wave-animation [animation-duration:6s] -z-42"></div>
        <div class="absolute inset-0 bg-[url('/background/wave7.svg')] bg-cover bg-center wave-animation [animation-duration:9s] -z-43"></div>
        <div class="absolute inset-0 bg-[url('/background/wave6.svg')] bg-cover bg-center wave-animation [animation-duration:12s] -z-44"></div>
        <div class="absolute inset-0 bg-[url('/background/wave5.svg')] bg-cover bg-center wave-animation [animation-duration:15s] -z-45"></div>
        <div class="absolute inset-0 bg-[url('/background/wave4.svg')] bg-cover bg-center wave-animation [animation-duration:18s] -z-46"></div>
        <div class="absolute inset-0 bg-[url('/background/wave3.svg')] bg-cover bg-center wave-animation [animation-duration:21s] -z-47"></div>
        <div class="absolute inset-0 bg-[url('/background/wave2.svg')] bg-cover bg-center wave-animation [animation-duration:24s] -z-48"></div>
        <div class="absolute inset-0 bg-[url('/background/wave1.svg')] bg-cover bg-center wave-animation [animation-duration:27s] -z-49"></div>
    </div>
    <main class="">
        <div class="flex flex-row justify-between items-center p-2 max-w-3xl mx-auto">
            <h1 class="text-4xl font-bold">AtomChatDB</h1>

            <div class="flex flex-col space-x-2 backdrop-blur-3xl p-2">
                <span>{data.address.address}</span>
                <span>{data.user.username}</span>
            </div>
        </div>
        <div class="w-11/12 mx-auto rounded-t-[75px] min-h-[calc(100vh-80px)] h-[calc(100vh-80px)] bg-neutral-500/10 backdrop-blur-md" transition:slide>
            <div class="pt-5 flex flex-col h-full">
                <div class="pt-2 pb-2 mx-[200px] flex flex-row justify-between">
                    <div class="flex items-center space-x-2">
                        <span>{posts.length} items</span>
                        {#if isLoadingPosts}
                            <span class="text-sm text-neutral-400 animate-pulse">updating...</span>
                        {:else}
                            <span class="text-sm underline cursor-pointer" onclick={() => getPosts()}>refresh</span>
                        {/if}
                    </div>
                    <div class="flex flex-row space-x-2">
                        <button class="font-bold underline cursor-pointer" onclick={() => createDraft()}>create post</button>
                        <a href="/" class="font-bold underline cursor-pointer">disconnect</a>
                    </div>
                </div>
                <hr class="w-full mx-auto">
                <!-- actual menus -->
                {#if posts.length === 0 && drafts.length === 0 && isLoadingPosts}
                    Loading...
                {:else}
                    <div class="mx-2 flex flex-row inset-0 h-[calc(100%-58px)]">
                        <!-- list -->
                        <div class="h-full border-r-2 border-neutral-500 inset-0 w-1/2 xl:w-2/5 pr-2">
                            {#if posts.length > 0 || drafts.length > 0}
                                <PostsList {drafts} {posts} {loadReplies} bind:currentlySelected={currentlySelected} />
                            {:else}
                                {@render cutecat()}
                            {/if}
                        </div>
                        <!-- reader -->
                        <div class="h-full w-1/2 xl:w-3/5 pl-2 overflow-y-scroll">
                            {#if currentlySelected}
                                <!-- draft editor form -->
                                {#if currentlySelected.startsWith('draft')}
                                    <PostWriter
                                        bind:draft={drafts[drafts.indexOf(drafts.find(d => d.id === currentlySelected))]}
                                        bind:currentlySelected={currentlySelected}
                                        discard={draft => { drafts = drafts.filter(v => v.id !== draft.id); currentlySelected = null; }}
                                        address={data.address.address}
                                        bind:isLoadingPosts={isLoadingPosts}
                                        {getPosts}
                                        form={form}
                                    />

                                {:else}
                                    <!-- post reader crap -->
                                    {@const post = posts.find(p => p.id === currentlySelected)}
                                    <div class="h-full overflow-y-scroll flex flex-col space-y-2">
                                        <PostReader {deletePost} {post} address={data.address.address} user={data.user} />
                                        {#each post.replies as reply, ind (reply.id)}
                                            {#if reply.id.startsWith("draft")}
                                                <ReplyWriter
                                                        discard={draft => post.replies = post.replies.filter(v => v.id !== draft.id)}
                                                        bind:draft={post.replies[ind]}
                                                        address={data.address.address}
                                                        submit={() => { loadReplies(post) }}
                                                        {form}
                                                        isLoadingData={() => new Promise(
                                                                resolve => {
                                                                    setInterval(() => {
                                                                        if (!isLoadingPosts) resolve()
                                                                    }, 50)
                                                                }
                                                            )}
                                                />
                                            {:else}
                                                <PostReader {deletePost} post={reply} address={data.address.address} user={data.user} />
                                            {/if}
                                        {/each}
                                        <div class="flex flex-row self-end">
                                            <button onclick={() => { currentlySelected = null; }} class="mb-2 p-2 cursor-pointer hover:bg-neutral-500/50 active:bg-neutral-600/50 shrink">back</button>
                                            <button
                                                    onclick={() => {
                                                    post.replies.push({
                                                        id: "draft_" + crypto.randomUUID(),
                                                        type: "reply",
                                                        title: "RE: " + post.title,
                                                        replyTo: post.id,
                                                        content: "This is a new reply. Edit me!",
                                                        username: data.user.username,
                                                        image: null,
                                                        authorId: data.user.id,
                                                        sentByGuest: data.user.isGuest,
                                                        createdAt: new Date(),
                                                    });
                                                }}
                                                    class="mb-2 p-2 cursor-pointer border-2 border-neutral-500 hover:bg-neutral-500/50 active:bg-neutral-600/50">reply</button>
                                        </div>
                                    </div>
                                {/if}
                            {:else}
                                nothing selected...
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </main>
</div>

{#snippet cutecat()}
    <div class="flex flex-row items-center space-x-5">
        <pre>


⠀⠀⡾⠻⢶⠶⣤⣄⠀⠀⠀⢀⣀⣀⡀⠀⠀⣀⣀⣀⣤⣤⣤⠤⠤⣤⣤⣤⠄⠀
⠀⠀⡇⠀⠀⠉⠢⣈⠛⠛⠛⠉⠉⠉⠉⠛⠋⠉⠉⠀⠀⢀⠠⠔⠊⢉⡼⠋⠀⠀
⠀⠀⣇⠀⠀⠀⠀⠈⠣⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠞⠁⠀⠀⣠⠟⠁⠀⠀⠀
⠀⠀⣿⠀⠀⠀⠀⠀⠀⠈⡄⠀⠀⠀⠀⠀⠀⠀⠀⡆⠀⠀⠀⠀⡏⠀⠀⠀⠀⠀
⠀⢀⡟⠢⢀⡀⠀⠀⣀⠠⠓⠀⠀⠀⠀⠀⠀⠀⠀⠈⢆⡀⠀⢀⡇⠀⠀⠀⠀⠀
⠀⡾⠀⠀⠀⠈⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣶⠞⠁⠀⠀⠀⠀⠀
⢸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀
⣾⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀⠀⠀⠀⠀⠀⠀
⣷⠀⠀⠀⠀⠀⠀⠈⢫⠋⣿⡖⢦⠀⠀⠀⢀⡴⣿⢙⡏⢉⡏⠀⠀⠀⠀⠀⠀⠀
⠘⢷⠀⠀⠀⠀⠀⠀⠀⠑⠂⠀⠓⢣⠀⠀⡞⠓⠚⠊⠀⠈⠙⢦⡀⠀⠀⠀⠀⠀
⠀⢸⡇⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠘⡄⢀⠇⠀⢀⠔⠁⠀⠀⠀⠙⢦⡀⠀⠀⠀
⠀⠀⡇⠀⠀⠀⠑⠤⡀⠀⠀⠀⠀⠀⣗⡜⠀⡠⠃⠀⠀⠀⠀⠀⠀⠈⠻⣄⠀⠀
⠀⠀⡇⠀⠀⠀⠀⠀⠈⠐⠤⢀⣀⣉⣉⠦⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣆⠀
⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⢹⡄
⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡄⠀⠀⢷
⠀⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⢸
⠀⠀⢻⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠃⠀⠀⢸
⠀⠀⠸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠀⠀⠀⢠
⠀⠀⠀⢻⡀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⢸
⠀⠀⠀⠘⣧⠀⠀⠀⠘⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠀⠀⠀⠀⣸
⠀⠀⠀⠀⢹⡀⠀⠀⠀⠘⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡎⠀⠀⠀⢠⡏
⠀⠀⠀⠀⠸⡇⠀⠀⠀⠀⠀⢱⡦⣤⣀⣀⣠⣤⡀⠀⠀⠀⠀⠀⠇⠀⠀⠀⣾⠁
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠘⡇⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⣼⠃⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⢀⡾⠁⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⢸⠇⠀⠀⠀⠀⠀⡴⠋⠀⠀⠀⠀
⠀⠀⠀⠀⣾⠋⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⢠⡟⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣀⡆⠀⠀⠀⠀⢀⡟⠀⠀⠀⠸⣆⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠙⣧⣀⣾⣤⡤⠞⠁⠀⠀⠀⠀⠙⣦⣄⣰⣧⣬⣿⠟⠀⠀⠀⠀⠀
                            </pre>
        <div>
            <h1 class="text-xl font-bold">no posts...</h1>
            <div>why don't you get something started?</div>
            <div>create a post (button on the top right)</div>
        </div>
    </div>
{/snippet}