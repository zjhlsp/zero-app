import { authenticate } from "../shopify.server";
export default async function action({ request, params }:any) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
  
    /** @type {any} */
    const data = {
      ...Object.fromEntries(await request.formData()),
      shop,
    };
  
    if (data.action === "delete") {
      await db.qRCode.delete({ where: { id: Number(params.id) } });
      return redirect("/app");
    }
  
    const errors = validateQRCode(data);
  
    if (errors) {
      return json({ errors }, { status: 422 });
    }
  
    const qrCode =
      params.id === "new"
        ? await db.qRCode.create({ data })
        : await db.qRCode.update({ where: { id: Number(params.id) }, data });
  
    return redirect(`/app/qrcodes/${qrCode.id}`);
  }