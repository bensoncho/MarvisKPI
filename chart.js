// 2025年每月工單數據（2025/3 - 2026/2）
let data = [
    { "category": "3月", "value": 674, "errorCount": 0 },
    { "category": "4月", "value": 763, "errorCount": 0 },
    { "category": "5月", "value": 539, "errorCount": 0 },
    { "category": "6月", "value": 619, "errorCount": 0 },
    { "category": "7月", "value": 588, "errorCount": 0 },
    { "category": "8月", "value": 675, "errorCount": 0 },
    { "category": "9月", "value": 1203, "errorCount": 0 },
    { "category": "10月", "value": 1200, "errorCount": 1 },
    { "category": "11月", "value": 1389, "errorCount": 0 },
    { "category": "12月", "value": 1310, "errorCount": 0 },
    { "category": "1月", "value": 1067, "errorCount": 0 },
    { "category": "2月", "value": 0, "errorCount": 0 }
];

// 從 JSON 檔案讀取數據 (要放 Server 才有用，先取消)
async function loadData() {
    try {
        const response = await fetch('data.json');
        data = await response.json();
        // 數據加載後呼叫圖表函數
        createResponsiveChart();
        createDonutChart();
        createParticleAnimation();
    } catch (error) {
        console.error('Error loading data:', error);
        // 如果讀取失敗，使用預設數據
    }
}

// 呼叫加載數據函數
loadData();


// 更新 KPI 卡片數據
function updateKPICards() {
    // 計算總工單數（排除 2月的 0）
    const validData = data.filter(d => d.value > 0);
    const totalOrders = validData.reduce((sum, d) => sum + d.value, 0);
    
    // 計算月平均產量
    const avgOrders = Math.round(totalOrders / validData.length);
    
    // 計算總錯誤數
    const totalErrors = data.reduce((sum, d) => sum + d.errorCount, 0);
    
    // 計算整體正確率
    const qualityRate = ((totalOrders - totalErrors) / totalOrders * 100).toFixed(2);
    
    // 更新 KPI 卡片
    document.getElementById('kpi-total').textContent = totalOrders.toLocaleString() + ' 張';
    document.getElementById('kpi-average').textContent = avgOrders.toLocaleString() + ' 張';
    document.getElementById('kpi-quality').textContent = qualityRate + '%';
    document.getElementById('kpi-errors').textContent = totalErrors + ' 張';
    
    // 添加淡入動畫
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}


// 響應式圖表函數
    function createResponsiveChart() {
        // 清除現有圖表
        d3.select("#chart").selectAll("*").remove();

        // 獲取容器寬度
        const containerWidth = document.querySelector('.chart-container').clientWidth;
        const aspectRatio = 0.5; // 高寬比
        
    // 設定圖表的寬度、高度和邊距
        const width = Math.min(containerWidth, 1200);
        const height = width * aspectRatio;
        const margin = {
            top: Math.max(40, height * 0.08),
            right: Math.max(30, width * 0.05),
            bottom: Math.max(60, height * 0.1),
            left: Math.max(50, width * 0.08)
        };
        

            // 設定 SVG 大小
            const svg = d3.select("#chart")
            .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet");

            // 定義更鮮豔的漸層色比例尺
            const colors = [
                "#FF6B9D", "#C44569", 
                "#FFA726", "#FF7043",
                "#66BB6A", "#26A69A",
                "#42A5F5", "#5C6BC0",
                "#AB47BC", "#7E57C2",
                "#EC407A", "#8E24AA"
            ];
            
            const colorScale = d3.scaleOrdinal()
                .domain(data.map(d => d.category))
                .range(colors);
            
            // 添加 SVG 漸層定義
            const defs = svg.append("defs");
            
            // 為每個類別創建漸層（使用類別名稱作為ID以確保一致性）
            data.forEach((d) => {
                const safeId = d.category.replace(/[^a-zA-Z0-9]/g, ''); // 移除特殊字元
                const gradient = defs.append("linearGradient")
                    .attr("id", `bar-gradient-${safeId}`)
                    .attr("x1", "0%")
                    .attr("y1", "100%")
                    .attr("x2", "0%")
                    .attr("y2", "0%");
                
                const baseColor = colorScale(d.category);
                gradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", baseColor)
                    .attr("stop-opacity", 0.8);
                
                gradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", baseColor)
                    .attr("stop-opacity", 1);
            });
        
    // 設定 x 和 y 軸的比例尺
    const x = d3.scaleBand()
        .domain(data.map(d => d.category)) // 保持原始資料的順序（時間順序）
        .range([margin.left, width - margin.right])
        .padding(0.3);

    // 添加右側 Y 軸的比例尺（用於準確率）
    const y2 = d3.scaleLinear()
    .domain([0, 100])  // 準確率範圍 0-100%
    .nice()
    .range([height - margin.bottom, margin.top]);

    // 在繪製左側 Y 軸後，添加右側 Y 軸
    svg.append("g")
    .attr("transform", `translate(${width - margin.right},0)`)
    .call(d3.axisRight(y2))
    .style("font-size", `${Math.max(10, width * 0.01)}px`)
    .style("color", "#666");

    // 添加右側 Y 軸標籤
    svg.append("text")
    .attr("transform", "rotate(90)")
    .attr("y", -(width - margin.right + width * 0.03))
    .attr("x", height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", `${Math.max(12, width * 0.012)}px`)
    .style("fill", "#2980b9")
    .text("準確率 (%)");

    // 創建折線生成器
    const line = d3.line()
    .x(d => x(d.category) + x.bandwidth() / 2)
    .y(d => y2(100 - (d.errorCount / d.value * 100)))
    .curve(d3.curveMonotoneX);  // 使用 monotone 插值使曲線更平滑

    // 添加準確率折線
    const path = svg.append("path")
    .datum(data)
    .attr("class", "accuracy-line")
    .attr("fill", "none")
    .attr("stroke", "#3498db")
    .attr("stroke-width", 3)
    .attr("d", line)
    .style("opacity", 0)
    .style("filter", "drop-shadow(0px 2px 4px rgba(52, 152, 219, 0.3))");

    // 添加折線動畫
    const pathLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", pathLength + " " + pathLength)
    .attr("stroke-dashoffset", pathLength)
    .transition()
    .delay(1000)
    .duration(1500)
    .style("opacity", 1)
    .attr("stroke-dashoffset", 0);

    // 添加折線上的數據點
    const dots = svg.selectAll(".accuracy-dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "accuracy-dot")
    .attr("cx", d => x(d.category) + x.bandwidth() / 2)
    .attr("cy", d => y2(100 - (d.errorCount / d.value * 100)))
    .attr("r", 5)
    .style("fill", "#ffffff")
    .style("stroke", "#3498db")
    .style("stroke-width", 2.5)
    .style("opacity", 0)
    .style("filter", "drop-shadow(0px 2px 6px rgba(52, 152, 219, 0.4))");

    // 添加數據點動畫
    dots.transition()
    .delay((d, i) => 1000 + i * 100)
    .duration(500)
    .style("opacity", 1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // 繪製 x 軸
    const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--axis-color').trim();
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
            .style("font-size", `${Math.max(10, width * 0.01)}px`)
        .style("color", axisColor);

    // 繪製 y 軸
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
            .style("font-size", `${Math.max(10, width * 0.01)}px`)
        .style("color", axisColor);

    // 添加 Y 軸標籤
    svg.append("text")
        .attr("transform", "rotate(-90)")
            .attr("y", margin.left - width * 0.03)
        .attr("x", -(height / 2))
        .attr("text-anchor", "middle")
            .style("font-size", `${Math.max(12, width * 0.012)}px`)
        .style("fill", axisColor)
        .text("工單數量");

    // 繪製柱狀圖並添加動畫效果
    const bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.category))
        .attr("y", height - margin.bottom)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", d => {
            const safeId = d.category.replace(/[^a-zA-Z0-9]/g, '');
            return `url(#bar-gradient-${safeId})`;
        })
        .attr("rx", Math.max(6, width * 0.008))
        .attr("ry", Math.max(6, width * 0.008))
        .style("filter", "drop-shadow(0px 4px 8px rgba(0,0,0,0.15))")
        .style("cursor", "pointer")
        .transition()
        .delay((d, i) => i * 80)
        .duration(1200)
        .ease(d3.easeBounceOut)
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value));
    
    // 加強 hover 效果
    svg.selectAll(".bar")
        .on("mouseenter", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .style("filter", "drop-shadow(0px 8px 16px rgba(0,0,0,0.3))")
                .attr("transform", "scale(1.05)");
        })
        .on("mouseleave", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .style("filter", "drop-shadow(0px 4px 8px rgba(0,0,0,0.15))")
                .attr("transform", "scale(1)");
        });

        // 修改標籤組的部分
        const labelGroups = svg.selectAll(".label-group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "label-group");

        // 添加工單數量標籤
        const labelColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
        const valueLabels = labelGroups.append("text")
            .attr("class", "value-label")
            .attr("x", d => x(d.category) + x.bandwidth() / 2)
            .attr("y", d => y(d.value) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", `${Math.max(10, width * 0.01)}px`)
            .style("fill", labelColor)
            .style("opacity", 0)
            .text(d => d.value + "張")
            .transition()
            .delay(1000)
            .duration(500)
            .style("opacity", 1);

        // 添加錯誤率標籤
        const errorRateLabels = labelGroups.append("text")
            .attr("class", "error-label")
            .attr("x", d => x(d.category) + x.bandwidth() / 2)
            .attr("y", d => y(d.value) + 15)
            .attr("text-anchor", "middle")
            .style("font-size", `${Math.max(9, width * 0.009)}px`)
            .style("fill", labelColor)
            .style("opacity", 0)
            .text(d => {
                if (d.value === 0) return "";
                return "錯誤率: " + ((d.errorCount / d.value) * 100).toFixed(2) + "%";
            })
            .transition()
            .delay(1000)
            .duration(500)
            .style("opacity", 1);

        // 添加錯誤張數標籤
        const errorCountLabels = labelGroups.append("text")
            .attr("class", "error-label")
            .attr("x", d => x(d.category) + x.bandwidth() / 2)
            .attr("y", d => y(d.value) + 30)
            .attr("text-anchor", "middle")
            .style("font-size", `${Math.max(9, width * 0.009)}px`)
            .style("fill", labelColor)
            .style("opacity", 0)
            .text(d => {
                if (d.value === 0) return "無工單";
                return "錯誤張數: " + d.errorCount;
            })
            .transition()
            .delay(1000)
            .duration(500)
            .style("opacity", 1);

        // 添加滑鼠事件處理
        svg.selectAll(".bar")
            .on("mouseover", function(event, d) {
                // 找到對應的標籤
                const currentBar = d3.select(this);
                const barX = currentBar.attr("x");
                const barWidth = currentBar.attr("width");
                
                // 選擇對應位置的標籤
                svg.selectAll(".value-label, .error-label")
                    .filter(function() {
                        const labelX = d3.select(this).attr("x");
                        return Math.abs(labelX - (parseFloat(barX) + parseFloat(barWidth)/2)) < 1;
                    })
                    .classed("highlight", true);

                // 高亮對應的折線數據點
                svg.selectAll(".accuracy-dot")
                    .filter(d2 => d2.category === d.category)
                    .transition()
                    .duration(200)
                    .attr("r", 6)
                    .style("fill", "#e74c3c");


            })
            .on("mouseout", function() {
                // 移除所有 highlight 類
                svg.selectAll(".value-label, .error-label")
                    .classed("highlight", false);

                // 恢復折線數據點樣式
                svg.selectAll(".accuracy-dot")
                    .transition()
                    .duration(200)
                    .attr("r", 4)
                    .style("fill", "#2980b9");

                // 移除準確率提示框
                svg.selectAll(".accuracy-tooltip").remove();
            });
    }

    // 甜甜圈圖表函數
    function createDonutChart() {
        // 清除現有圖表
        d3.select("#donut-chart").selectAll("*").remove();

        // 設定圖表尺寸
        const containerWidth = document.querySelector('.donut-chart-container').clientWidth;
        const width = Math.min(containerWidth, 600);
        const height = width;
        const radius = Math.min(width, height) / 2;

        // 設定數據
        const top3_data = [...data]
            .sort((a, b) => b.value - a.value)
            .slice(0, 3)
            .map((d, i) => ({
                name: d.category + "份工單",
                value: d.value,
                color: ["#3498db", "#2ecc71", "#9b59b6"][i]
            }));
        // 建立SVG元素
        const svg = d3.select("#donut-chart")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        // 建立圓餅圖生成器
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        // 建立弧形生成器
        const arc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius * 0.8);

        // 建立標籤弧形生成器
        const labelArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        // 繪製甜甜圈圖並添加動畫
        const arcs = svg.selectAll("arc")
            .data(pie(top3_data))
            .enter()
            .append("g");
        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .style("opacity", 0)
            .style("stroke", "white")
            .style("stroke-width", 2)
            .transition()
            .duration(1000)
            .style("opacity", 0.8)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        // 添加數值標籤
        arcs.append("text")
            .attr("transform", d => {
                const centroid = arc.centroid(d);
                return `translate(${centroid[0]},${centroid[1]})`;
            })
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#666")
            .style("opacity", 0)
            .text(d => d.data.name + ' ' + d.data.value + "張")
            .transition()
            .delay(1000)
            .duration(500)
            .style("opacity", 1);

        // 添加標題並添加淡入動畫
        const title = d3.select("#donut-chart")
            .append("text")
            .attr("x", width/2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text("每月工單高峰期");

        title.transition()
            .duration(1000)
                .style("opacity", 1);

        // 清除現有圖例
        d3.select(".donut-legend").remove();

        // 添加圖例並添加淡入動畫
        const legend = d3.select(".donut-chart-container")
            .append("div")
            .attr("class", "donut-legend");

        top3_data.forEach((item, index) => {            
            const legendItem = legend.append("div")
                .attr("class", "legend-item")
                .style("opacity", 0);

            legendItem.append("div")
                .attr("class", "legend-color")
                .style("background-color", item.color);

            legendItem.append("span")
                .text(`${item.name}: ${item.value}張`);

            legendItem.transition()
                .delay(index * 200)
                .duration(500)
                .style("opacity", 1);
        });
    }

    // 月對月成長圖表函數
    function createGrowthChart() {
        d3.select("#growth-chart").selectAll("*").remove();
        
        const containerWidth = document.querySelector('.growth-chart-container').clientWidth;
        const width = Math.min(containerWidth, 1200);
        const height = 400;
        const margin = { top: 40, right: 30, bottom: 60, left: 60 };
        
        // 準備數據：計算月對月變化百分比
        const validData = data.filter(d => d.value > 0);
        const growthData = validData.map((d, i) => {
            if (i === 0) return { ...d, growth: 0, growthPercent: 0 };
            const prevValue = validData[i - 1].value;
            const growth = d.value - prevValue;
            const growthPercent = ((growth / prevValue) * 100).toFixed(1);
            return { ...d, growth, growthPercent: parseFloat(growthPercent) };
        });
        
        const svg = d3.select("#growth-chart")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);
        
        const x = d3.scaleBand()
            .domain(growthData.map(d => d.category))
            .range([margin.left, width - margin.right])
      .padding(0.3);
        
        const maxValue = d3.max(growthData, d => d.value);
        const y = d3.scaleLinear()
            .domain([0, maxValue])
            .nice()
            .range([height - margin.bottom, margin.top]);
        
        // X軸
        const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--axis-color').trim();
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .style("font-size", "12px")
            .style("color", axisColor);
        
        // Y軸
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .style("font-size", "12px")
            .style("color", axisColor);
        
        // 繪製柱狀圖
        svg.selectAll(".growth-bar")
            .data(growthData)
            .enter()
            .append("rect")
            .attr("class", "growth-bar")
            .attr("x", d => x(d.category))
            .attr("y", height - margin.bottom)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", d => d.growthPercent >= 0 ? "#27ae60" : "#e74c3c")
            .attr("rx", 6)
            .style("opacity", 0.8)
            .transition()
            .delay((d, i) => i * 100)
            .duration(800)
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value));
        
        // 添加成長百分比標籤
        svg.selectAll(".growth-label")
            .data(growthData)
            .enter()
            .append("text")
            .attr("class", "growth-label")
            .attr("x", d => x(d.category) + x.bandwidth() / 2)
            .attr("y", d => y(d.value) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight", "600")
            .style("fill", d => d.growthPercent >= 0 ? "#27ae60" : "#e74c3c")
            .style("opacity", 0)
            .text(d => d.growthPercent !== 0 ? `${d.growthPercent > 0 ? '+' : ''}${d.growthPercent}%` : '')
            .transition()
            .delay((d, i) => i * 100 + 500)
            .duration(500)
            .style("opacity", 1);
    }


        // 在檔案末尾添加粒子動畫函數
        function createParticleAnimation() {
            const svg = d3.select("#background-animation");
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // 設置 SVG 尺寸
            svg
                .attr("width", width)
                .attr("height", height);

            // 粒子數據
            const particleCount = 50;
            const particles = Array.from({ length: particleCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1,
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2
            }));

            // 創建粒子
            const circles = svg.selectAll(".particle")
                .data(particles)
                .enter()
                .append("circle")
                .attr("class", "particle")
                .attr("r", d => d.radius)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            // 動畫函數
            function animate() {
                circles
                    .each(d => {
                        // 更新位置
                        d.x += d.dx;
                        d.y += d.dy;

                        // 邊界檢查
                        if (d.x < 0 || d.x > width) d.dx *= -1;
                        if (d.y < 0 || d.y > height) d.dy *= -1;
                    })
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                // 連接近距離的粒子
                const maxDistance = 100;
                particles.forEach((p1, i) => {
                    particles.slice(i + 1).forEach(p2 => {
                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < maxDistance) {
                            const opacity = (1 - distance / maxDistance) * 0.2;
                            svg.append("line")
                                .attr("x1", p1.x)
                                .attr("y1", p1.y)
                                .attr("x2", p2.x)
                                .attr("y2", p2.y)
                                .style("stroke", "#3498db")
                                .style("stroke-width", 1)
                                .style("opacity", opacity)
                                .transition()
                                .duration(100)
                                .style("opacity", 0)
                                .remove();
                        }
                    });
                });

                requestAnimationFrame(animate);
            }

            // 開始動畫
            animate();

            // 處理視窗大小變化
            function handleResize() {
                const newWidth = window.innerWidth;
                const newHeight = window.innerHeight;
                
                svg
                    .attr("width", newWidth)
                    .attr("height", newHeight);

                // 調整粒子位置
                particles.forEach(p => {
                    if (p.x > newWidth) p.x = newWidth;
                    if (p.y > newHeight) p.y = newHeight;
                });
            }

            window.addEventListener('resize', handleResize);
        }


        // 初始化圖表
        updateKPICards();
        createResponsiveChart();
        createGrowthChart();
        // 監聽視窗大小變化
        window.addEventListener('resize', () => {
            createResponsiveChart();
            createGrowthChart();
            createDonutChart();
        });
        // 初始化甜甜圈圖
        createDonutChart();
        // 初始化粒子動畫
        createParticleAnimation();

// Theme Toggle Functionality
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Redraw charts to update colors
    createResponsiveChart();
    createGrowthChart();
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Initialize theme on page load
loadSavedTheme();

// Add event listener to toggle button
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}