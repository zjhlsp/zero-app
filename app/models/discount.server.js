import db from "../db.server";

export async function getRule(id, graphql) {
  const rule = await db.discount1.findFirst({ where: { id } });

  if (!rule) {
    return null;
  }
  return rule;
}

export async function getRules(shop, graphql) {
  const rules = await db.discount1.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (rules.length === 0) return [];
  return rules;
}

export function validateRule(data) {
  const errors = {};

  if (!data.name) {
    errors.name = "名称错误";
  }

  if (data.type === "buy_x_get_y") {
    if (!data.giftedProductId || !data.requiredProductId) {
      errors.giftedProductId = "请检查买赠产品";
      errors.requiredProductId = "请检查买赠产品";
    }
  } else if (data.type === "spend_x_save_y") {
    if (!data.spendThreshold || !data.discountAmount) {
      errors.spendThreshold = "请检查消费金额和减免金额";
      errors.discountAmount = "请检查消费金额和减免金额";
    }
  } else {
    errors.type = "优惠类型错误";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

// 获取买赠商品信息
export async function supplementRule(rule, graphql) {
  if (rule.type === "buy_x_get_y") {
    // 查询购买商品和赠送商品的信息
    const requiredProductResponse = await graphql(
      `
        query buyProduct($id: ID!) {
          product(id: $id) {
            title
            images(first: 1) {
              nodes {
                url
                altText
              }
            }
          }
        }
      `,
      {
        variables: {
          id: rule.requiredProductId, // 需要购买的产品 ID
        },
      },
    );

    const giftedProductResponse = await graphql(
      `
        query gift($id: ID!) {
          product(id: $id) {
            title
            images(first: 1) {
              nodes {
                url
                altText
              }
            }
          }
        }
      `,
      {
        variables: {
          id: rule.giftedProductId, // 赠送的产品 ID
        },
      },
    );

    const requiredProduct = (await requiredProductResponse.json()).data.product;
    const giftedProduct = (await giftedProductResponse.json()).data.product;

    return {
      product: {
        title: requiredProduct?.title,
        img: requiredProduct?.images?.nodes[0]?.url,
        // alt: requiredProduct?.images?.nodes[0]?.altText,
  
      },
      gift: {
        title: giftedProduct?.title,
        img: giftedProduct?.images?.nodes[0]?.url,
        // alt: giftedProduct?.images?.nodes[0]?.altText,
      }
    }
  }

  return {};
}
