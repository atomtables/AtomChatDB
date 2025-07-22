<script>
    let {data} = $props();
    let analytics = $derived(data.analytics);
</script>

<div class="backdrop-blur-sm w-full p-2 flex flex-col items-center space-y-2">
    <div>Popular Addresses</div>
    <a class="w-full p-2 hover:bg-neutral-500/20 flex flex-row space-x-2 justify-between" href="/news.groups.proposals">
        <span>news.groups.proposals</span>
        <span class="text-neutral-300">{analytics['news.groups.proposals']?.size ?? 0} member{analytics['news.groups.proposals']?.size === 1 ? '' : 's'}</span>
    </a>
    <a class="w-full p-2 hover:bg-neutral-500/20 flex flex-row space-x-2 justify-between" href="/hackclub.demo.chat">
        <span>hackclub.demo.chat</span>
        <span class="text-neutral-300">{analytics?.["hackclub.demo.chat"]?.size || 0} member{analytics?.['hackclub.demo.chat']?.size === 1 ? '' : 's'}</span>
    </a>
    <a class="w-full p-2 hover:bg-neutral-500/20 flex flex-row space-x-2 justify-between" href="/hackclub.demo.news">
        <span>hackclub.demo.news</span>
        <span class="text-neutral-300">{analytics?.["hackclub.demo.news"]?.size || 0} member{analytics?.['hackclub.demo.news']?.size === 1 ? '' : 's'}</span>
    </a>
</div>