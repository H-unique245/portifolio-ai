import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Send contact form email directly to Hemant's inbox.
 * Template variables expected in EmailJS template:
 *   {{from_name}}, {{from_email}}, {{message}}, {{reply_to}}
 */
export async function sendContactEmail({ name, email, message }) {
  const result = await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      from_name:  name,
      from_email: email,
      reply_to:   email,
      message,
    },
    PUBLIC_KEY
  );
  return result;
}
