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
import { useState, useEffect } from "react";

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
  
  // 管理按钮的加载状态
  const [button1Loading, setButton1Loading] = useState(false);
  const [button2Loading, setButton2Loading] = useState(false);

  const handlePost = (actionType: string) => {
    if (actionType === "button1") {
      setButton1Loading(true);
    } else if (actionType === "button2") {
      setButton2Loading(true);
    }

    // 触发提交请求
    fetcher.submit({ actionType }, { method: "post" });
  };

  // 使用 useEffect 来避免每次渲染时更新状态
  useEffect(() => {
    if (fetcher.data) {
      setButton1Loading(false);
      setButton2Loading(false);
    }
  }, [fetcher.data]); // 只有当 fetcher.data 发生变化时才更新按钮状态

  return (
    <Page>
      <TitleBar title="Additional page" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Button 
                onClick={() => handlePost("button1")} 
                loading={button1Loading}
                disabled={button1Loading}
              >
                触发接口1
              </Button>
              <Button 
                onClick={() => handlePost("button2")} 
                loading={button2Loading}
                disabled={button2Loading}
              >
                触发接口2
              </Button>
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
