import Nav from "../components/Nav";
import CategorySlider from "../components/CategorySlider";
import PageHeader from "../components/PageHeader";
import "./Home.css";
import { useState } from "react";

export default function Homepage() {
  return (
    <>
      <div className="home_container">
        <PageHeader isOnCreatePost={true} isOnSearchBar={true} />
        <div className="page_body">
          <Nav currentPage={" home"} />

          <div className="home_main_container">
            <CategorySlider />

            <div className="post_container"></div>
          </div>
        </div>
      </div>
    </>
  );
}
