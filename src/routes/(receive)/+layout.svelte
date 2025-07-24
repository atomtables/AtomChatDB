<script>
    let { children } = $props();
</script>

<main class="w-screen h-screen flex flex-col items-center justify-center">
    <div class="flex flex-col items-center justify-center">
        <div class="text-center flex flex-row justify-between items-end w-max">
            <h1 class="text-4xl font-bold w-83 text-left">AtomChatDB</h1>
            <div class="w-48 text-right">by atomtables</div>
        </div>
        <div class="text-center p-2">
            A huge group of people separated by four identifiers.
        </div>
        {@render children()}
    </div>
</main>








