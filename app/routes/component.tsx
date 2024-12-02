/* eslint-disable @typescript-eslint/no-unused-vars */

import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import {
  Card,
  EmptyState,
  ButtonGroup,
  Button,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  InlineStack,
} from "@shopify/polaris";
import {EditIcon, DeleteIcon} from '@shopify/polaris-icons';
import db from "../db.server";
import type { RuleData } from "./rule.model";
export const EmptyRulesState = ({ onAction }: any) => (
  <EmptyState
    heading="还没有规则捏"
    action={{
      content: "创建规则",
      onAction,
    }}
    image="https://static.hoverair.com/shopify-app/cat.jpg"
  >
    {/* <p>零零满减规则</p> */}
  </EmptyState>
);

export const RuleTable = ({ Rules }: {Rules:RuleData[]}) => (
  <IndexTable
    resourceName={{
      singular: "Rule",
      plural: "Rules",
    }}
    itemCount={Rules.length}
    headings={[
      { title: "Thumbnail", hidden: true },
      { title: "规则名称" },
      { title: "规则类型" },
      { title: "创建时间" },
      { title: "状态" },
      { title: "累计使用次数" },
      { title: "操作" },
    ]}
    selectable={false}
  >
    {Rules.map((rule) => (
      <RuleTableRow key={rule.id} rule={rule} />
    ))}
  </IndexTable>
);

export const RuleTableRow = ({ rule }:{rule:any}) => {
    const navigate = useNavigate();
    const handleDelete = async (id:number) => {
      await db.discount2.delete({
        where: { id: Number(id) }
      });
    }
  return (
    <IndexTable.Row id={rule.id} position={rule.id}>
      <IndexTable.Cell>
          <span>{rule.name}</span>
      </IndexTable.Cell>
      <IndexTable.Cell>
          <span>{rule.name}</span>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {truncate(rule.type)}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {new Date(rule.createdAt).toDateString()}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {truncate(rule.status)}
      </IndexTable.Cell>
      <IndexTable.Cell>{rule.counts}</IndexTable.Cell>
      <IndexTable.Cell>
      <ButtonGroup>
        <Button onClick={() => navigate(`rules/${rule.id}`)} icon={EditIcon}>编辑</Button>
        <Button onClick={() => handleDelete(rule.id)} icon={DeleteIcon}  tone="critical" >删除</Button>
      </ButtonGroup>
      </IndexTable.Cell>
  
    </IndexTable.Row>
  )
};


function truncate(str:string, { length = 25 } = {}) {
    if (!str) return "";
    if (str === 'buy_x_get_y') {
      return '买赠'
    }
    if (str === 'spend_x_save_y') {
      return '满减'
    }
    if (str === 'active') {
      return '🟢 启用'
    }
    if (str === 'inactive') {
      return '🟠 禁用'
    }
    if (str.length <= length) return str;
    return str.slice(0, length) + "…";
  }
