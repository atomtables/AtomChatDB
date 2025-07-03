export const load = ({params}) => {
    return {
        slugs: {
            domain: params.domain,
            class: params?.class || null,
            focus: params?.focus || null,
            topic: params?.topic || null
        }
    }
}