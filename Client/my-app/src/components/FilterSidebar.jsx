import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({
    types,
    colors,
    selectedType,
    selectedColors,
    onTypeSelect,
    onColorSelect,
    selectedPriceRange,
    onPriceRangeSelect
}) => {
    const priceRanges = [
        { label: 'Under $20', min: 0, max: 19.99 },
        { label: '$20 - $35', min: 20, max: 35 },
        { label: 'Over $35', min: 35.01, max: Infinity }
    ];

    const handleColorSelect = (color) => {
        if (selectedColors.includes(color)) {
            onColorSelect(selectedColors.filter(c => c !== color));
        } else {
            onColorSelect([...selectedColors, color]);
        }
    };


    const getColorStyle = (color) => {
        if (color.toLowerCase() === 'nude') {

            return { backgroundColor: '#f7e7ce' };

        } else if (color.toLowerCase() === 'brown') {
            return { backgroundColor: '#7b3f00' };
        }
        return { backgroundColor: color };
    };

    return (
        <div className="filter-sidebar">
            <h3>Filter by Type</h3>
            <ul>
                <li
                    className={selectedType === '' ? 'active' : ''}
                    onClick={() => onTypeSelect('')}
                >
                    All
                </li>
                {types.map(type => (
                    <li
                        key={type}
                        className={selectedType === type ? 'active' : ''}
                        onClick={() => onTypeSelect(type)}
                    >
                        {type}
                    </li>
                ))}
            </ul>

            <h3>Filter by Price</h3>
            <ul>
                <li
                    className={selectedPriceRange === null ? 'active' : ''}
                    onClick={() => onPriceRangeSelect(null)}
                >
                    All Prices
                </li>
                {priceRanges.map((range, index) => (
                    <li
                        key={index}
                        className={selectedPriceRange === index ? 'active' : ''}
                        onClick={() => onPriceRangeSelect(index)}
                    >
                        {range.label}
                    </li>
                ))}
            </ul>
            <h3>Filter by Color</h3>
            <div className="color-options">
                {colors.map(color => (
                    <div
                        key={color}
                        className={`color-swatch ${selectedColors.includes(color) ? 'active' : ''}`}
                        style={getColorStyle(color)}
                        onClick={() => handleColorSelect(color)}
                        title={color}
                    />
                ))}
            </div>
        </div>
    );
};

export default FilterSidebar;
