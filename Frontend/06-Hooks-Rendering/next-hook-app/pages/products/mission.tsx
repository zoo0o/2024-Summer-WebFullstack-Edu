import { useState, useEffect } from "react";
import { Category } from "@/interfaces/product";
import { Product } from "@/interfaces/product";

import Link from "next/link";

const categoryData: Category[] = [
  {
    category_id: 0,
    category: "전체보기",
    sort: 0,
  },
  {
    category_id: 1,
    category: "노트북",
    sort: 1,
  },
  {
    category_id: 2,
    category: "냉장고",
    sort: 2,
  },
];

const productData: Product[] = [
  {
    product_id: 1,
    category_id: 1,
    product_name: "삼성 노트북 2024 갤럭시북4",
    manufacturer: "삼성전자",
    price: 939000,
    stock: 1,
    image: "string",
  },
  {
    product_id: 2,
    category_id: 1,
    product_name: "LG 노트북 그램",
    manufacturer: "LG전자",
    price: 1539000,
    stock: 2,
    image: "string",
  },
  {
    product_id: 3,
    category_id: 1,
    product_name: "LG 75인치 UHD TV 75UP7750PVA",
    manufacturer: "LG전자",
    price: 2990000,
    stock: 1,
    image: "string",
  },
  {
    product_id: 4,
    category_id: 2,
    product_name: "삼성 냉장고 2023 XDFDD071B4",
    manufacturer: "삼성전자",
    price: 590000,
    stock: 4,
    image: "string",
  },
  {
    product_id: 5,
    category_id: 2,
    product_name: "삼성 냉장고 2024 RS84T5071B4",
    manufacturer: "삼성전자",
    price: 609000,
    stock: 6,
    image: "string",
  },
];

const ProductList = () => {
  //콤보박스에 바인딩될 카테고리 목록
  const [categories, setCategories] = useState<Category[]>([]);

  //콤보박스에서 선택된 단일 분류정보
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  //제품 테이블에 바인딩될 제품 목록
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setCategories(categoryData);
    setProducts(productData);
  }, []);

  const categorySerch = () => {
    let searchResult: Product[] = [];

    if (selectedCategory == 0) {
      setProducts(productData);
    } else {
      searchResult = productData.filter(
        (item) => item.category_id === selectedCategory
      );
      setProducts(searchResult);
    }
  };

  return (
    <div className="m-4 ml-4">
      <div>
        {/* 제품 카테고리 선택 영역 */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          onClick={categorySerch}
        >
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category}
            </option>
          ))}
        </select>
      </div>

      <h1 className="m-4">Product List</h1>

      {/* 카테고리 선택 결과 목록 표시영역 */}
      <div className="m-4">
        <table className="w-full border-collapse border border-slate-400 text-left">
          <thead>
            <tr>
              <th>제품번호</th>
              <th>제품명</th>
              <th>제조사</th>
              <th>가격</th>
            </tr>
          </thead>
          <tbody>
            {products.map((products, index) => (
              <tr key={index}>
                <td>{products.product_id}</td>
                <td>{products.product_name}</td>
                <td>{products.manufacturer}</td>
                <td>{products.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
