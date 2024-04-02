<template>
    <div>{{ resource }} {{ action }}: {{ $ability.can(action, resource) }}</div>
</template>
<script>
export default {
    name: 'PermissionText',
    props: ['resource', 'action'],
}
</script>
