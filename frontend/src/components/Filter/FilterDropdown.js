import React from "react";
import './FilterDropdown.css';

const FilterDropdown = ({
  sortBy,
  setSortBy,
  filterCategory,
  setFilterCategory,
  filterLocation,
  setFilterLocation,
}) => {
  return (
    <div className="filter-dropdown">
      <label>
        Sort By:
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="popular">Most Liked</option>
        </select>
      </label>

      <label>
        Category:
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Politics">Politics</option>
          <option value="Cricket">Cricket</option>
          <option value="Weather">Weather</option>
          <option value="Technology">Technology</option>
        </select>
      </label>

      <label>
        Location:
        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
          <option value="">All Locations</option>
          <option value="Delhi">Delhi</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
        </select>
      </label>
    </div>
  );
};

export default FilterDropdown;
