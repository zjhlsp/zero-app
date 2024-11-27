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
  DatePicker,
  Divider,
  EmptyState,
  InlineStack,
  SkeletonThumbnail,
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

// 判断是否是新建
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

// 服务端表单操作
export async function action({ request, params }: any) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data: any = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  if (data.action === "delete") {
    await db.discount1.delete({ where: { id: Number(params.id) } });
    return redirect("/app");
  }

  const errors = validateRule(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const rule =
    params.id === "new"
      ? await db.discount1.create({ data })
      : await db.discount1.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app/qrcodes/${rule.id}`);
}

export default function RuleForm() {
  const errors: any = useActionData<typeof action>()?.errors || {};
  const ruleData: RuleData = useLoaderData(); // loader初始数据
  const [formState, setFormState] = useState(ruleData);
  const [cleanFormState, setCleanFormState] = useState(ruleData);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);
  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";
  const navigate = useNavigate();

  let product: any = {};
  let gift: any = {};
  // const [formState, setFormState] = useState(ruleData);

  async function selectProduct(type: "product" | "gift") {
    const products: any = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
    });

    if (products) {
      const { images, id, variants, title, handle } = products[0];
      const product = {
        img: images[0].originalSrc,
        id,
        title,
        handle,
      };
      if (type === "product") {
        setFormState({
          ...formState,
          requiredProductId: id,
          requiredProduct: product,
        });
      } else {
        setFormState({
          ...formState,
          giftedProductId: variants[0].id,
          giftedProduct: product,
        });
      }
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
      counts: formState.counts,
      createdAt: formState.createdAt,
      spendThreshold: formState.spendThreshold || "",
      discountAmount: formState.discountAmount || "",
      requiredProductId: formState.requiredProductId || "",
      requiredQuantity: formState.requiredQuantity || "",
      giftedProductId: formState.giftedProductId || "",
      giftedQuantity: formState.giftedQuantity || "",
      maxGiftedQuantity: formState.maxGiftedQuantity || "",
      startTime: formState.startTime || "",
      endTime: formState.giftedQuantity || "",
      userEligibility: formState.giftedQuantity || "",
      maxUsage: formState.giftedQuantity || "",
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={ruleData.id ? "编辑" : "新建"}>
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          主页
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h3"} variant="headingMd">
                  规则名称
                </Text>
                <TextField
                  id="name"
                  helpText="规则名称"
                  label="name"
                  labelHidden
                  autoComplete="off"
                  value={formState.name}
                  onChange={(name) => setFormState({ ...formState, name })}
                  error={errors.title}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <Text as={"h3"} variant="headingMd">
                  规则类型
                </Text>
                <ChoiceList
                  title=""
                  choices={[
                    { label: "买 X 赠送 Y 礼品", value: "buy_x_get_y" },
                    { label: "满 X 元减免 Y 元", value: "spend_x_save_y" },
                  ]}
                  selected={[formState.type]}
                  onChange={(type: ("buy_x_get_y" | "spend_x_save_y")[]) =>
                    setFormState({
                      ...formState,
                      type: type[0],
                    })
                  }
                  error={errors.type}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="500">
              <Text as={"h3"} variant="headingMd">
                需要购买的产品
              </Text>
              <InlineStack gap="500" blockAlign="center">
                {formState?.requiredProduct?.img ? (
                  <Thumbnail
                    source={formState?.requiredProduct?.img || ""}
                    size="large"
                    alt="Black choker necklace"
                  />
                ) : (
                  <SkeletonThumbnail size="large" />
                )}
                <BlockStack gap="300">
                  <Text as={"h3"} variant="headingMd">
                    产品名：{formState?.requiredProduct?.title}
                  </Text>
                  <Button
                    onClick={() => selectProduct("product")}
                    id="select-product"
                  >
                    Select product
                  </Button>
                  {errors.id ? (
                    <InlineError message={errors.id} fieldID="myFieldID" />
                  ) : null}
                </BlockStack>
              </InlineStack>
              <InlineStack gap="300">
                <TextField
                  label="需要购买的最低数量"
                  type="number"
                  value={(formState?.requiredQuantity as string) || "1"}
                  onChange={(number) =>
                    setFormState({
                      ...formState,
                      requiredQuantity: Number(number),
                    })
                  }
                  autoComplete="off"
                />
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="500">
              <Text as={"h3"} variant="headingMd">
                赠送的礼品
              </Text>
              <InlineStack gap="500" blockAlign="center">
                {formState?.giftedProduct?.img ? (
                  <Thumbnail
                    source={formState?.giftedProduct?.img || ""}
                    size="large"
                    alt="Black choker necklace"
                  />
                ) : (
                  <SkeletonThumbnail size="large" />
                )}
                <BlockStack gap="300">
                  <Text as={"h3"} variant="headingMd">
                    产品名：{formState?.giftedProduct?.title}
                  </Text>
                  <Button
                    onClick={() => selectProduct("gift")}
                    id="select-gift"
                  >
                    Select Gift
                  </Button>
                  {errors.id ? (
                    <InlineError message={errors.id} fieldID="myFieldID" />
                  ) : null}
                </BlockStack>
              </InlineStack>
              <InlineStack gap="300">
                <TextField
                  label="赠送礼品的数量"
                  type="number"
                  value={(formState?.giftedQuantity as string) || "1"}
                  onChange={(number) =>
                    setFormState({
                      ...formState,
                      giftedQuantity: Number(number),
                    })
                  }
                  autoComplete="off"
                />
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !ruleData.id || !ruleData || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
