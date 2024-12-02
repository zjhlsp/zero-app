/* eslint-disable @typescript-eslint/no-unused-vars */
import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { useEffect  } from "react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  InlineStack,
} from "@shopify/polaris";

import { getRules } from "../models/discount.server";
import {  RuleTable, EmptyRulesState } from "./component";
import db from '../db.server'

export async function loader({ request }:any) {
  const { admin, session } = await authenticate.admin(request);
  const Rules = await getRules(session.shop, admin.graphql);
  const Shop = session.shop;

  return json({
    Rules,
    Shop
  });
}
export async function action({ request }: any) {
  const formData = await request.formData();
  const actionType = formData.get("action");
  if (actionType === "delete") {
    await db.discount2.delete({ where: { id: Number(formData.get("id")) } });
  }

  return json({ info: "删除", msg: "删除成功" });
}

export default function Index() {
  const { Rules, Shop }:any = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page>
      <ui-title-bar title={`${JSON.stringify(Shop, null, 2).replace('.myshopify.com"', '').replace("\"", '')} 满减`}>
        <button variant="primary" onClick={() => navigate("/app/rules/new")}>
          创建规则
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
        <Card padding="0">
            {Rules.length === 0 ? (
              <EmptyRulesState onAction={() => navigate("rules/new")} />
            ) : (
            <RuleTable Rules={Rules} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
