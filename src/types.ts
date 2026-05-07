/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Category {
  VETEMENT = 'vetement',
  PANTALON = 'pantalon',
  CHAUSSURE = 'chaussure',
  ACCESSOIRE = 'accessoire'
}

export interface Product {
  id?: string;
  name: string;
  category: Category;
  initialPrice: number;
  newPrice: number;
  isPromotion: boolean;
  isLiquidation: boolean;
  imageUrl: string;
  createdAt: number;
}

export interface AdminConfig {
  whatsappLink: string;
  heroImages: string[]; // List of image URLs for the hero slider
}
