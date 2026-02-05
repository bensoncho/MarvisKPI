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

            // 定義顏色比例尺
            const colorScale = d3.scaleLinear()
                .domain([0, data.length - 1])
                .range(["#FF9999", "#99CCFF"])
                .interpolate(d3.interpolateHcl);
        
    // 設定 x 和 y 軸的比例尺
    const x = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([margin.left, width - margin.right])
        .padding(0.1);

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
    .attr("stroke", "#2980b9")
    .attr("stroke-width", 2)
    .attr("d", line)
    .style("opacity", 0)
    .style("filter", "drop-shadow(2px 2px 3px rgba(0,0,0,0.1))");

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
    .attr("r", 4)
    .style("fill", "#2980b9")
    .style("opacity", 0)
    .style("filter", "drop-shadow(2px 2px 3px rgba(0,0,0,0.1))");

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
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
            .style("font-size", `${Math.max(10, width * 0.01)}px`)
        .style("color", "#666");

    // 繪製 y 軸
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
            .style("font-size", `${Math.max(10, width * 0.01)}px`)
        .style("color", "#666");

    // 添加 Y 軸標籤
    svg.append("text")
        .attr("transform", "rotate(-90)")
            .attr("y", margin.left - width * 0.03)
        .attr("x", -(height / 2))
        .attr("text-anchor", "middle")
            .style("font-size", `${Math.max(12, width * 0.012)}px`)
        .text("工單數量");

    // 繪製柱狀圖並添加動畫效果
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.category))
        .attr("y", height - margin.bottom)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", (d, i) => colorScale(i))
            .attr("rx", Math.max(3, width * 0.005))
            .attr("ry", Math.max(3, width * 0.005))
        .style("filter", "drop-shadow(2px 2px 3px rgba(0,0,0,0.2))")
        .transition()
        .duration(1000)
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value));

        // 修改標籤組的部分
        const labelGroups = svg.selectAll(".label-group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "label-group");

        // 添加工單數量標籤
        const valueLabels = labelGroups.append("text")
            .attr("class", "value-label")
            .attr("x", d => x(d.category) + x.bandwidth() / 2)
            .attr("y", d => y(d.value) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", `${Math.max(10, width * 0.01)}px`)
            .style("fill", "#666")
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
            .style("fill", "#666")
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
            .style("fill", "#666")
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

                    .style("fill", "white")
                    .style("font-size", "12px")
                    .text(`${accuracy}%`);
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

    // 添加圖表標題
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
            .style("font-size", `${Math.max(14, width * 0.015)}px`)
        .style("font-weight", "bold")
        .text("2025年每月工單數量及錯誤率趨勢");
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
        const top3_data = data
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
        createResponsiveChart();
        // 監聽視窗大小變化
        window.addEventListener('resize', createResponsiveChart);
        // 初始化甜甜圈圖
        createDonutChart();
        // 監聽視窗大小變化
        window.addEventListener('resize', createDonutChart);
        // 初始化粒子動畫
        createParticleAnimation();                