import { CollectionConfig } from 'payload'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'inquiryType', 'createdAt'],
  },
  access: {
    create: () => true, // Allow anyone to submit the contact form
    read: () => true, // Ideally restrict this in production, but open for now as per common pattern in this project
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'inquiryType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Customer Inquiry',
          value: 'customer',
        },
        {
          label: 'Partner Inquiry',
          value: 'partner',
        },
        {
          label: 'Driver Inquiry',
          value: 'driver',
        },
      ],
      defaultValue: 'customer',
    },
  ],
}
