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
import {
  getRule,
  supplementRule,
  validateRule,
} from "../models/discount.server";
import type { RuleData } from "./rule.model";

// 判断是否是新建
// 根据id初始化单个配置页
export async function loader({ request, params }: any) {
  const { admin } = await authenticate.admin(request);
  let product;
  let gift;
  if (params.id === "new") {
    return json({
      ruleData: {
        status: "active",
        name: "",
        type: "buy_x_get_y",
      },
      product,
      gift,
    });
  }
  const ruleData: any = await getRule(Number(params.id));

  const result = await supplementRule(ruleData, admin.graphql);
  product = result.product;
  gift = result.gift;
  return {
    ruleData: ruleData,
    product,
    gift,
  };
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
    await db.discount2.delete({ where: { id: Number(params.id) } });
    return redirect("/app");
  }
  const errors = validateRule(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }
  
  data.counts = 0;
  if (data.counts) {
    data.counts = Number(data.counts);
  }
  data.startTime = new Date();
  data.endTime = new Date();
  if (data.maxUsage) {
    data.maxUsage = Number(data.maxUsage);
  }
  if (data.spendThreshold) {
    data.spendThreshold = Number(data.spendThreshold);
  }
  if (data.discountAmount) {
    data.discountAmount = Number(data.discountAmount);
  }
  if (data.id) {
    data.id = Number(data.id);
  }
  data.requiredQuantity = Number(data.requiredQuantity);
  data.maxGiftedQuantity = Number(data.maxGiftedQuantity);
  data.giftedQuantity = Number(data.giftedQuantity);
  const rule =
    params.id === "new"
      ? await db.discount2.create({ data: data })
      : await db.discount2.update({
          where: { id: Number(params.id) },
          data: data,
        });

  return redirect(`/app`);
}

export default function RuleForm() {
  const errors = useActionData()?.errors || {};
  const { ruleData, product, gift }: any = useLoaderData(); // loader初始数据

  const [productState, setProductState] = useState(product);
  const [giftState, setGiftState] = useState(gift);

  const [formState, setFormState] = useState(ruleData);
  const [cleanFormState, setCleanFormState] = useState(ruleData);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);
  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";
  const navigate = useNavigate();

  async function selectProduct(type: "product" | "gift") {
    const products: any = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
    });

    if (products) {
      const { images, id, variants, title, handle } = products[0];
      if (type === "product") {
        setProductState({
          img: images[0].originalSrc,
          title,
        });
        setFormState({
          ...formState,
          requiredProductId: id,
        });
      } else {
        setGiftState({
          img: images[0].originalSrc,
          title,
        });
        setFormState({
          ...formState,
          giftedProductId: id,
        });
      }
    }
  }
  const submit = useSubmit();
  function handleSave() {
    const data = formState;

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
              <BlockStack gap="300">
                <Text as={"h3"} variant="headingMd">
                  基本配置
                </Text>
                <TextField
                  id="name"
                  helpText="规则名称"
                  label="name"
                  labelHidden
                  autoComplete="off"
                  value={formState.name}
                  onChange={(name) => setFormState({ ...formState, name })}
                  error={errors.name}
                />
                <TextField
                  id="name"
                  helpText="描述"
                  label="description"
                  labelHidden
                  autoComplete="off"
                  value={formState.description}
                  onChange={(description) =>
                    setFormState({ ...formState, description:description || '' })
                  }
                  error={errors.description}
                />
                <ChoiceList
                  title="状态"
                  choices={[
                    { label: "启用", value: "active" },
                    { label: "禁用", value: "inactive" },
                  ]}
                  selected={formState.status}
                  onChange={(status) =>
                    setFormState({
                      ...formState,
                      status: status,
                    })
                  }
                  error={errors.status}
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
        {/* 买赠类型 */}
        {formState.type === "buy_x_get_y" && (
          <>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="500">
                  <Text as={"h3"} variant="headingMd">
                    需要购买的产品
                  </Text>
                  <InlineStack gap="500" blockAlign="center">
                    {productState?.img ? (
                      <Thumbnail
                        source={productState?.img || ""}
                        size="large"
                        alt="Black choker necklace"
                      />
                    ) : (
                      <SkeletonThumbnail size="large" />
                    )}
                    <BlockStack gap="300">
                      <Text as={"h3"} variant="headingMd">
                        产品名：{productState?.title || "未选择产品"}
                      </Text>
                      <Button
                        onClick={() => selectProduct("product")}
                        id="select-product"
                      >
                        选择产品
                      </Button>
                      {errors.requiredProductId ? (
                        <InlineError
                          message={errors.requiredProductId}
                          fieldID="myFieldID"
                        />
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
                    {giftState?.img ? (
                      <Thumbnail
                        source={giftState?.img || ""}
                        size="large"
                        alt="Black choker necklace"
                      />
                    ) : (
                      <SkeletonThumbnail size="large" />
                    )}
                    <BlockStack gap="300">
                      <Text as={"h3"} variant="headingMd">
                        赠品名：{giftState?.title || "未选择赠品"}
                      </Text>
                      <Button
                        onClick={() => selectProduct("gift")}
                        id="select-gift"
                      >
                        选择赠品
                      </Button>
                      {errors.giftedProductId ? (
                        <InlineError
                          message={errors.giftedProductId}
                          fieldID="giftedProductId"
                        />
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
                    <TextField
                      label="单次购买最大赠品数量"
                      type="number"
                      value={(formState?.maxGiftedQuantity as string) || "1"}
                      onChange={(number) =>
                        setFormState({
                          ...formState,
                          maxGiftedQuantity: Number(number),
                        })
                      }
                      autoComplete="off"
                    />
                    {errors.maxGiftedQuantity ? (
                      <InlineError
                        message={errors.maxGiftedQuantity}
                        fieldID="maxGiftedQuantity"
                      />
                    ) : null}
                  </InlineStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          </>
        )}

        {/* 满减类型 */}
        {formState.type === "spend_x_save_y" && (
          <>
            <Layout.Section>
              <Card>
                <BlockStack gap="500">
                  <TextField
                    label="触发额度"
                    type="number"
                    value={(formState?.spendThreshold as string) || "1"}
                    onChange={(number) =>
                      setFormState({
                        ...formState,
                        spendThreshold: Number(number),
                      })
                    }
                    autoComplete="off"
                  />
                  <TextField
                    label="减免价格"
                    type="number"
                    value={(formState?.discountAmount as string) || "1"}
                    onChange={(number) =>
                      setFormState({
                        ...formState,
                        discountAmount: Number(number),
                      })
                    }
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>
            </Layout.Section>
          </>
        )}

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
