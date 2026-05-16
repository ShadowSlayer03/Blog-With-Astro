import { config, fields, collection, component } from '@keystatic/core';

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'lone-blogger-team/blog-with-astro',
  },
  ui: {
    brand: {
      name: 'Arjun Nambiar Blog CMS',
    },
    navigation: {
      Content: ['blog'],
    },
  },
  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Publication Date' }),
        repComm: fields.text({ label: 'REP COMM %', defaultValue: '0%' }),

        content: fields.document({
          label: 'Content',
          formatting: true,
          dividers: true,
          links: true,
          tables: true,
          componentBlocks: {
            image: component({
              label: 'Custom Image',
              schema: {
                src: fields.text({
                  label: 'Image URL / Public Path',
                  validation: { length: { min: 1 } }
                }),
                alt: fields.text({ label: 'Alt Text', defaultValue: '' }),
                class: fields.text({ label: 'Extra CSS Classes', defaultValue: '' }),
                loading: fields.select({
                  label: 'Loading Strategy',
                  options: [
                    { label: 'Lazy (Default)', value: 'lazy' },
                    { label: 'Eager', value: 'eager' },
                  ],
                  defaultValue: 'lazy',
                }),
                decoding: fields.select({
                  label: 'Decoding Strategy',
                  options: [
                    { label: 'Async (Default)', value: 'async' },
                    { label: 'Sync', value: 'sync' },
                    { label: 'Auto', value: 'auto' },
                  ],
                  defaultValue: 'async',
                }),
              },
              preview: (props) => null,
            }),
            video: component({
              label: 'Custom Video',
              schema: {
                src: fields.text({
                  label: 'Video Source URL',
                  validation: { length: { min: 1 } }
                }),
                class: fields.text({
                  label: 'Extra CSS Classes',
                  defaultValue: 'w-full rounded-xl my-8'
                }),
              },
              preview: (props) => null,
            }),
          },
        }),
      },
    }),
  },
});
