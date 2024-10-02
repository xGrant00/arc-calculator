   let forecast_grid, summary_grid;
    document.head.querySelector('link').remove();

    // Report elements
    const run_button = document.querySelector('.run-report');
    const platform = document.querySelector('.platform');
    const product_amazon = document.querySelector('.product-amazon');
    const product_walmart = document.querySelector('.product-walmart');
    const profit_split = document.querySelector('.profit-split');
    const initial_inventory_amount = document.querySelector('.initial-inventory-amount');
    const margin = document.querySelector('.margin');
    const secondary_inventory_amount = document.querySelector('.secondary-inventory-amount');
    const month_start = document.querySelector('.month-start');
    const roi_buyin = document.querySelector('.roi_buyin');
    const roi_buyin_inventory = document.querySelector('.roi_buyin_inventory');
    let product = document.querySelector('.product.active');

    run_button.addEventListener('click', runReport);
    platform.addEventListener('change', platformChange);
    product.addEventListener('change', productChange);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            runReport();
        }
    });

    const USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    const gridjs_styles = {
        padding: "0px",
        tbody: {
            "background-color": "#14161a",
        },
        th: {
            "background-color": "rgb(31, 34, 41)",
            color: "#fff",
            border: "1px solid #14161a",
        },
        td: {
            "background-color": "rgb(51, 55, 64)",
            color: "#fff",
            border: "1px solid #14161a",
        },
    };

    // TODO: Remove as this is for debugging purposes
    // initial_inventory_amount.value = 15000;
    // month_start.value = 12;
    // runReport();
    // window.scrollTo(0, document.body.scrollHeight);

    function renderBasedOnInventory() {
        const inventory_amount = Number(initial_inventory_amount.value);
        const platform_selected = platform.value;

        let above_15k = false;
        if (inventory_amount >= 15000) {
            above_15k = true;
        }

        // Reset amazon-above,under-15k and walmart-above,under-15k
        document.querySelectorAll('.amazon-above-15k, .amazon-under-15k, .walmart-above-15k, .walmart-under-15k').forEach(e => e.classList.remove('active'));

        let above_15k_el, under_15k_el;
        if (platform_selected == 'Amazon') {
            above_15k_el = document.querySelectorAll('.amazon-above-15k');
            under_15k_el = document.querySelectorAll('.amazon-under-15k');
        } else {
            above_15k_el = document.querySelectorAll('.walmart-above-15k');
            under_15k_el = document.querySelectorAll('.walmart-under-15k');
        }

        if (above_15k) {
            above_15k_el.forEach(e => e.classList.add('active'));
            under_15k_el.forEach(e => e.classList.remove('active'));
        } else {
            above_15k_el.forEach(e => e.classList.remove('active'));
            under_15k_el.forEach(e => e.classList.add('active'));
        }
    }

    function platformChange() {
        const selected_platform = platform.value;

        if (selected_platform === 'Amazon') {
            product_amazon.classList.add('active');
            product_walmart.classList.remove('active');
        } else {
            product_amazon.classList.remove('active');
            product_walmart.classList.add('active');
        }

        product.removeEventListener('change', productChange);
        product = document.querySelector('.product.active');
        product.addEventListener('change', productChange);
        product.dispatchEvent(new Event('change'));
    }

    function productChange() {
        const selected_platform = platform.value;
        const selected_product = product.value;

        if (selected_platform == "Amazon") {
            document.querySelectorAll('.amazon').forEach(e => e.classList.add('active'));
            document.querySelectorAll('.walmart').forEach(e => e.classList.remove('active'));
        } else {
            document.querySelectorAll('.walmart').forEach(e => e.classList.add('active'));
            document.querySelectorAll('.amazon').forEach(e => e.classList.remove('active'));
        }

        if (selected_platform == "Amazon" && selected_product == "45000") {
            profit_split.innerHTML = "75/25";
        } else if (selected_platform == "Amazon") {
            profit_split.innerHTML = "70/30";
        }

        if (selected_platform == "Walmart" && selected_product == "35000") {
            profit_split.innerHTML = "75/25";
        } else if (selected_platform == "Walmart") {
            profit_split.innerHTML = "70/30";
        }
    }

    function runReport() {
        const report_result_el = document.querySelector('.report-results');
        const inventory_amount = Number(initial_inventory_amount.value);

        if (inventory_amount < 5000) {
            initial_inventory_amount.classList.add('has-error');
            initial_inventory_amount.focus();
            alert('You must have an initial inventory amount of at least $5,000');
            return;
        } else {
            initial_inventory_amount.classList.remove('has-error');
        }

        if (!secondary_inventory_amount.value) {
            secondary_inventory_amount.value = 0;
        }

        report_result_el.classList.add('active');

        calcSummaryTable();
        calcForecastTable();
        renderBasedOnInventory();
    }

    function calcForecastTable() {
        // Forecast table values
        const revenue = ["Revenue"];
        const platform_seller_fees = ["Platform Seller Fees"];
        const cogs = ["COGS"];
        const gross_profit = ["Gross Profit (GP)"];
        const gp_margin = ["GP Margin"];
        const profit_split = ["Profit Split"];
        const software = ["Software"];
        const dedicated_staff = ["Dedicated Staff"];
        const net_profit = ["Net Profit"];
        const net_profit_percent = ["Net Profit %"];
        const cumulative = ["Cumulative"];

        let calc_roi_buyin = null;
        let calc_roi_buyin_inventory = null;
        for (let i = 1; i <= 24; i++) {
            const month = i;

            let m_cogs = 0;
            switch (month) {
                case 1:
                    m_cogs = 1000;
                    break;
                case 2:
                    m_cogs = 3000;
                    break;
                case 3:
                    m_cogs = 5000;
                    break;
                case 4:
                    m_cogs = Math.min(Number(initial_inventory_amount.value), 10000);
                    break;
                default:
                    m_cogs = Number(initial_inventory_amount.value);
                    break;
            }

            if (month >= month_start.value) {
                m_cogs += Number(secondary_inventory_amount.value);
            }

            cogs[i] = m_cogs;

            const m_revenue = Number(m_cogs / 0.6);
            revenue[i] = m_revenue;

            const m_platform_seller_fees = Number(m_revenue * 0.15);
            platform_seller_fees[i] = m_platform_seller_fees;

            const m_gross_profit = Number(m_revenue - m_platform_seller_fees - m_cogs);
            gross_profit[i] = m_gross_profit;

            const m_gp_margin = m_gross_profit / m_revenue;
            gp_margin[i] = m_gp_margin;

            const m_profit_split = Number(m_gross_profit * getProfitSplit());
            profit_split[i] = m_profit_split;

            const m_software = platform.value === 'Amazon' ? 250 : 130;
            software[i] = m_software;

            if (month >= 4) {
                const m_dedicated_staff = Number(Math.max(Math.floor(m_revenue / 30000), 1) * 400);
                dedicated_staff[i] = m_dedicated_staff;
            }

            const m_net_profit = Number(m_gross_profit - m_software - m_profit_split);
            net_profit[i] = m_net_profit;

            const m_net_profit_percent = Number(m_net_profit / m_revenue);
            net_profit_percent[i] = m_net_profit_percent;

            const prev_cumulative = cumulative.length == 1 ? 0 : cumulative[cumulative.length - 1];
            const m_cumulative = Number(prev_cumulative) + Number(m_net_profit);
            cumulative[i] = m_cumulative;

            if (m_cumulative >= Number(product.value)) {
                if (!calc_roi_buyin) {
                    calc_roi_buyin = month;
                }
            }

            if (m_cumulative >= Number(product.value) + Number(initial_inventory_amount.value)) {
                if (!calc_roi_buyin_inventory) {
                    calc_roi_buyin_inventory = month;
                }
            }
        }

        // Format
        const formatDollars = (val) => {
            if (!val) return "";
            const dollar_amt = USDollar.format(val);
            if (dollar_amt === "$NaN") {
                console.error("Error formatting", val);
                return "Error Formatting";
            }

            return dollar_amt;
        }

        const formatPercent = (val) => {
            if (!val) return "";
            return `${(val * 100).toFixed(2)}%`;
        }


        const total_cost = Number(initial_inventory_amount.value) + Number(product.value);
        for (let i = 1; i <= 24; i++) {
            const cumlative_color = cumulative[i] >= total_cost ? "#41dc8e" : "#FF7F7F";
            revenue[i] = formatDollars(revenue[i]);
            platform_seller_fees[i] = formatDollars(platform_seller_fees[i]);
            cogs[i] = formatDollars(cogs[i]);
            gross_profit[i] = formatDollars(gross_profit[i]);
            gp_margin[i] = formatPercent(gp_margin[i]);
            profit_split[i] = formatDollars(profit_split[i]);
            software[i] = formatDollars(software[i]);
            dedicated_staff[i] = formatDollars(dedicated_staff[i]);
            net_profit[i] = formatDollars(net_profit[i]);
            net_profit_percent[i] = formatPercent(net_profit_percent[i]);
            cumulative[i] = gridjs.html(`<div style="color: ${cumlative_color}">${formatDollars(cumulative[i])}`);
        }

        if (forecast_grid) {
            forecast_grid.destroy();
        }

        roi_buyin.innerHTML = calc_roi_buyin ? `Month ${calc_roi_buyin}` : "Cost not covered";
        roi_buyin_inventory.innerHTML = calc_roi_buyin_inventory ? `Month ${calc_roi_buyin_inventory}` : "Cost not covered";
        forecast_grid = new gridjs.Grid({
            columns: [
                { name: "", width: "200px" },
                "Month 1",
                "Month 2",
                "Month 3",
                "Month 4",
                "Month 5",
                "Month 6",
                "Month 7",
                "Month 8",
                "Month 9",
                "Month 10",
                "Month 11",
                "Month 12",
                "Month 13",
                "Month 14",
                "Month 15",
                "Month 16",
                "Month 17",
                "Month 18",
                "Month 19",
                "Month 20",
                "Month 21",
                "Month 22",
                "Month 23",
                "Month 24"
            ],
            data: [
                revenue,
                platform_seller_fees,
                cogs,
                gross_profit,
                gp_margin,
                profit_split,
                software,
                dedicated_staff,
                net_profit,
                net_profit_percent,
                cumulative
            ],
            style: gridjs_styles
        }).render(document.getElementById('forecast-table'));
    }

    function getProfitSplit() {
        const selected_platform = platform.value;
        const selected_product = product.value;

        if (selected_platform == "Amazon" && selected_product == "45000") {
            return .25;
        } else if (selected_platform == "Amazon") {
            return .30;
        }

        if (selected_platform == "Walmart" && selected_product == "35000") {
            return .25;
        } else if (selected_platform == "Walmart") {
            return .30;
        }
    }

    function calcSummaryTable() {
        const revenue = Number(initial_inventory_amount.value / .6);

        const data = {
            "Revenue": USDollar.format(revenue),
            ...calc_profit_from_revenue(revenue)
        };

        if (summary_grid) {
            summary_grid.destroy();
        }

        let data_array = Object.keys(data).map((key) => [key]);
        let table_columns = [{ name: "", width: "500px" }];

        if (platform.value == "Walmart") {
            table_columns.push("Month 1");
            for (const idx in data_array) {
                const key = data_array[idx][0];
                data_array[idx].push(data[key]);
            }
        } else {
            table_columns.push("Month 0", "Month 1");
            data_array = [["Upfront Inventory"], ...data_array]
            data_array[0].push(USDollar.format(initial_inventory_amount.value));
            for (const idx in data_array) {
                const key = data_array[idx][0];
                data_array[idx].push("");
                data_array[idx].push(data[key]);
            }
        }

        table_columns.push("Worst", "Best");
        const calc_worst_data = calc_profit_from(0.05);
        const calc_best_data = calc_profit_from(0.25);
        for (const idx in data_array) {
            const key = data_array[idx][0];
            data_array[idx].push(calc_worst_data[key]);
            data_array[idx].push(calc_best_data[key]);
        }

        summary_grid = new gridjs.Grid({
            columns: table_columns,
            data: data_array,
            style: gridjs_styles
        }).render(document.getElementById('single-inventory-table'));
    }

    function calc_profit_from_revenue(revenue) {
        const platform_fee_percent = platform.value === 'Amazon' ? .15 : .15;
        const software_cost = platform.value === 'Amazon' ? 250 : 130;
        const platform_fees = Number(revenue * platform_fee_percent);
        const gross_profit = Number(revenue - platform_fees - initial_inventory_amount.value);
        const operating_expenses = Number((Math.max(Math.floor(revenue / 30000), 1)) * 400 + software_cost);
        const profit_split = Number(gross_profit * getProfitSplit());
        const net_profit = Number(gross_profit - operating_expenses - profit_split);

        return {
            "Inventory Cost": USDollar.format(initial_inventory_amount.value),
            "Platform Fees": USDollar.format(platform_fees),
            "Gross Profit": USDollar.format(gross_profit),
            "Operating Expenses": USDollar.format(operating_expenses),
            "Profit Split": USDollar.format(profit_split),
            "Net Profit": USDollar.format(net_profit),
            "Net Profit %": `${(net_profit / revenue * 100).toFixed(2)}%`,
            "Next Inventory Purchase (if net profits were rolled into next purchase)": USDollar.format(Math.max(net_profit + Number(initial_inventory_amount.value), 0))
        };
    }

    function convertDollarToNumber(dollar) {
        return parseFloat(dollar.replace(/[^0-9.-]+/g, ""));
    }


    function calc_profit_from(desired_profit_percent) {
        const investment = Number(initial_inventory_amount.value);
        let low = investment;  // Minimum possible revenue
        let high = investment * 100;  // A reasonably high upper bound
        const epsilon = 0.0001;  // Desired precision

        while (high - low > epsilon) {
            let mid = (low + high) / 2;
            let result = calc_profit_from_revenue(mid);
            let current_profit_percent = parseFloat(result["Net Profit %"]) / 100;

            if (Math.abs(current_profit_percent - desired_profit_percent) < epsilon) {
                return { "Revenue": USDollar.format(mid), ...result };
            } else if (current_profit_percent < desired_profit_percent) {
                low = mid;  // The correct revenue is higher
            } else {
                high = mid;  // The correct revenue is lower
            }
        }

        // If we exit the loop, we return the result for the midpoint
        return { "Revenue": USDollar.format(low + high), ...calc_profit_from_revenue((low + high) / 2) };
    }
