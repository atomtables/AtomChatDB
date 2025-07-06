<script>
    let {
        onclick,
        children,
        ...etc
    } = $props();

    let isStage = $state(false);
    let timeout;

    async function handleClick(event) {
        if (isStage) { await onclick?.(event) }
        else {
            isStage = true;
            timeout = setTimeout(() => {
                isStage = false;
            }, 2000);
        }
    }
</script>

<button {...etc} onclick={handleClick}>{@render children()}{isStage ? '?' : ''}</button>