import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  Button,
  BlockStack,
} from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";

// action 负责处理 POST 请求
export async function action({ request }: any) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "button1") {
    console.log("按钮1触发的接口逻辑");
    return json({ info: "按钮1成功调用接口", msg: "处理逻辑A完成" });
  } else if (actionType === "button2") {
    console.log("按钮2触发的接口逻辑");
    return json({ info: "按钮2成功调用接口", msg: "处理逻辑B完成" });
  }

  return json({ info: "未知操作", msg: "未匹配的逻辑" });
}

export default function AdditionalPage() {
  const fetcher = useFetcher();

  const handlePost = (actionType: string) => {
    fetcher.submit({ actionType }, { method: "post" });
  };

  return (
    <Page>
      <TitleBar title="Additional page" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Button onClick={() => handlePost("button1")}>触发接口1</Button>
              <Button onClick={() => handlePost("button2")}>触发接口2</Button>
              {fetcher.data && (
                <Text as="p" variant="bodyMd">
                  接口返回数据：{fetcher.data.info}, 消息：{fetcher.data.msg}
                </Text>
              )}
              <Text as="p" variant="bodyMd">
                The app template comes with an additional page which
                demonstrates how to create multiple pages within app navigation
                using{" "}
                <Link
                  url="https://shopify.dev/docs/apps/tools/app-bridge"
                  target="_blank"
                  removeUnderline
                >
                  App Bridge
                </Link>
                .
              </Text>
              <Text as="p" variant="bodyMd">
                To create your own page and have it show up in the app
                navigation, add a page inside <Code>app/routes</Code>, and a
                link to it in the <Code>&lt;NavMenu&gt;</Code> component found
                in <Code>app/routes/app.jsx</Code>.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Resources
              </Text>
              <List>
                <List.Item>
                  <Link
                    url="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
                    target="_blank"
                    removeUnderline
                  >
                    App nav best practices
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
