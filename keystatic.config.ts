import { config, fields, collection } from '@keystatic/core';

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
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { isRequired: true },
        }),
        pubDate: fields.date({
          label: 'Published Date',
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: 'Updated Date',
        }),
        heroImage: fields.text({
          label: 'Hero Image URL',
          description: 'URL or path to the hero image',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        draft: fields.checkbox({
          label: 'Draft',
          defaultValue: false,
          description: 'Draft posts are not published',
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
        }),
      },
    }),
  },
});
