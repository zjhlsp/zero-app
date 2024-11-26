export interface RuleData {
    id:number | string;
    name:string;
    type: 'buy_x_get_y' | 'spend_x_save_y';
    status: 'active' | 'inactive';
    description?: string;
    counts: number;
    createdAt: string;
    spendThreshold?: number | '';
    discountAmount?: number | '';
  
    requiredProductId?: number | '';
    requiredQuantity?: number | '';
    giftedProductId?: number | '';
    giftedQuantity?: number | '';
}