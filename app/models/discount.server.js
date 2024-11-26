import db from '../db.server';

export async function getRule(id, graphql) {
    const rule = await db.newdiscount.findFirst({ where: { id } });
  
    if (!rule) {
        return null;
    }
  
    return supplementRule(rule, graphql);
}

export async function getRules(shop, graphql) {
    const rules = await db.newdiscount.findMany({
      where: { shop },
      orderBy: { id: "desc" },
    });
  
    if (rules.length === 0) return [];
  
    return Promise.all(
        rules.map((rule) => supplementRule(rule, graphql))
    );
  }

  export function validateRule(data) {
    const errors = {};
  
    if (!data.name) {
      errors.name = "名称错误";
    }
  
    if (data.type === 'buy_x_get_y' ) {
        if(!data.giftedProductId || !data.requiredProductId) {
            errors.giftedProductId = "请检查买赠产品";
            errors.requiredProductId = "请检查买赠产品";
        }
    } else if (data.type ==='spend_x_save_y') {
        if(!data.spendThreshold || !data.discountAmount) {
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
async function supplementRule(rule, graphql) {
    if (rule.type === 'buy_x_get_y') {
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
            }
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
            }
        );

        const requiredProduct = (await requiredProductResponse.json()).data.product;
        const giftedProduct = (await giftedProductResponse.json()).data.product;

        return {
            ...rule,
            requiredProductTitle: requiredProduct?.title,
            requiredProductImage: requiredProduct?.images?.nodes[0]?.url,
            requiredProductAlt: requiredProduct?.images?.nodes[0]?.altText,
            giftedProductTitle: giftedProduct?.title,
            giftedProductImage: giftedProduct?.images?.nodes[0]?.url,
            giftedProductAlt: giftedProduct?.images?.nodes[0]?.altText,
        };
    } else if (rule.type === 'spend_x_save_y') {
        return {
            ...rule,
            spendThreshold: rule.spendThreshold, // 满金额阈值
            discountAmount: rule.discountAmount, // 减免金额
        };
    } else {
        throw new Error(`Unsupported rule type: ${rule.type}`);
    }
}

// import db from '../db.server';

// export async function getRule(id, graphql) {
//     const rule = await db.discounts.findFirst({ where: { id } });
  
//     if (!rule) {
//         return null;
//     }
  
//     return supplementRule(rule, graphql);
// }

// export async function getRules(shop, graphql) {
//     const rules = await db.discounts.findMany({
//         where: { shop },
//         orderBy: { id: "desc" },
//     });
  
//     if (rules.length === 0) return [];
  
//     return Promise.all(
//         rules.map((rule) => supplementRule(rule, graphql))
//     );
// }

// export function validateQRCode(data) {
//     const errors = {};
  
//     if (!data.name) {
//         errors.name = "名称不能为空";
//     }
  
//     if (data.type === 'buy_x_get_y') {
//         if (!data.giftedProductId) {
//             errors.giftedProductId = "赠送产品 ID 必填";
//         }
//         if (!data.requiredProductId) {
//             errors.requiredProductId = "购买产品 ID 必填";
//         }
//     } else if (data.type === 'spend_x_save_y') {
//         if (!data.spendThreshold) {
//             errors.spendThreshold = "消费门槛金额必填";
//         }
//         if (!data.discountAmount) {
//             errors.discountAmount = "减免金额必填";
//         }
//     } else {
//         errors.type = "优惠类型无效";
//     }
  
//     return Object.keys(errors).length ? errors : null;
// }

// // 获取商品信息的通用函数
// async function fetchProduct(productId, graphql) {
//     const response = await graphql(
//         `
//           query fetchProduct($id: ID!) {
//             product(id: $id) {
//               title
//               images(first: 1) {
//                 nodes {
//                   url
//                   altText
//                 }
//               }
//             }
//           }
//         `,
//         { variables: { id: productId } }
//     );
//     const product = (await response.json()).data.product;
//     return {
//         title: product?.title,
//         imageUrl: product?.images?.nodes[0]?.url,
//         imageAlt: product?.images?.nodes[0]?.altText,
//     };
// }

// // 补充规则信息
// async function supplementRule(rule, graphql) {
//     if (rule.type === 'buy_x_get_y') {
//         // 查询购买商品和赠送商品的信息
//         const requiredProduct = await fetchProduct(rule.requiredProductId, graphql);
//         const giftedProduct = await fetchProduct(rule.giftedProductId, graphql);

//         return {
//             ...rule,
//             requiredProductTitle: requiredProduct.title,
//             requiredProductImage: requiredProduct.imageUrl,
//             requiredProductAlt: requiredProduct.imageAlt,
//             giftedProductTitle: giftedProduct.title,
//             giftedProductImage: giftedProduct.imageUrl,
//             giftedProductAlt: giftedProduct.imageAlt,
//         };
//     } else if (rule.type === 'spend_x_save_y') {
//         // 补充满减规则的信息
//         return {
//             ...rule,
//             spendThreshold: rule.spendThreshold, // 满金额阈值
//             discountAmount: rule.discountAmount, // 减免金额
//         };
//     } else {
//         throw new Error(`Unsupported rule type: ${rule.type}`);
//     }
// }

