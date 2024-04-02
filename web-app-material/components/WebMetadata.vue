<script>
import { mapGetters } from 'vuex'

export default {
    name: 'WebMetadata',

    head() {
        return {
            title: this.$accessor.tenant.getTheme.name,
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'homePageText',
                },
                {
                    hid: 'og:type',
                    property: 'og:type',
                    content: 'website',
                },
                {
                    hid: 'og:title',
                    property: 'og:title',
                    content: this.getTheme.name,
                },
                {
                    hid: 'og:description',
                    property: 'og:description',
                    content: 'homePageText',
                },
                {
                    hid: 'og:image',
                    property: 'og:image',
                    content: this.checkHost(),
                },
                {
                    hid: 'og:image:alt',
                    property: 'og:image:alt',
                    content: 'homePageText',
                },
            ],
        }
    },

    computed: {
        ...mapGetters('tenant', ['getTheme']),
    },

    methods: {
        checkHost() {
            if (this.getTheme.posterlab) {
                return 'https://posterlab-production.s3.eu-central-1.amazonaws.com/favicon.png'
            } else {
                return typeof this.getTheme.images.primaryLogo === 'object'
                    ? this.getTheme.images.primaryLogo.url ||
                          this.getTheme.images.primaryLogo.location
                    : 'https://posterlab-production.s3.eu-central-1.amazonaws.com/favicon.png'
            }
        },
    },

    render() {
        return this.$scopedSlots.default
    },
}
</script>

<style></style>
