/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import db from "../db.server";
import { getRule, validateRule } from "../models/discount.server";
import type { RuleData } from "./rule.model";

// 根据id初始化单个配置页
export async function loader({ request, params }: any) {
  const { admin } = await authenticate.admin(request);
  if (params.id === "new") {
    return json({
      name: "",
      type: "buy_x_get_y",
    });
  }

  return json(await getRule(Number(params.id), admin.graphql));
}

// 表单操作
export async function action({ request, params }: any) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data: any = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  if (data.action === "delete") {
    await db.discounts.delete({ where: { id: Number(params.id) } });
    return redirect("/app");
  }

  const errors = validateRule(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const rule =
    params.id === "new"
      ? await db.discounts.create({ data })
      : await db.discounts.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app/qrcodes/${rule.id}`);
}

export default function RuleForm() {
  const data = useActionData<typeof action>();
  const ruleData: RuleData = useLoaderData();
  const [formState, setFormState] = useState(ruleData);
  const [cleanFormState, setCleanFormState] = useState(ruleData);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);
  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";
  const navigate = useNavigate();

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
    });

    if (products) {
      const { images, id, variants, title, handle } = products[0];

      setFormState({
        ...formState,
        productId: id,
        productVariantId: variants[0].id,
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,
      });
    }
  }
  const submit = useSubmit();
  function handleSave() {
    const data = {
      id: formState.id,
      name: formState.name,
      type: formState.type,
      description: formState.description || "",
      status: formState.status,
      counts: formState.counts ,
      createdAt: formState.createdAt,
      spendThreshold: formState.spendThreshold || "",
      discountAmount: formState.discountAmount || "",
      requiredProductId: formState.requiredProductId || "",
      requiredQuantity: formState.requiredQuantity || "",
      giftedProductId: formState.giftedProductId || "",
      giftedQuantity: formState.giftedQuantity || "",
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={ruleData.id ? "Edit Rule" : "Create new Rule"}>
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          Rule
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            tesxt1
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
