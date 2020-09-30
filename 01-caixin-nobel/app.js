import {
  countryList,
  nobelDotColor,
  nbAllPerson,
  secondPieData,
  personCountPerYP,
  // NBData,
  // nobelImgSource,
} from "./datas.js";

function drawChart() {
  const width = 640;
  let dimensions = {
    width: width,
    height: width,
    radius: width / 2,
    pieInnerRadius: 95,
    pieOuterRadius: 110,
    ageInnerRadius: 125,
    ageOuterRadius: 200,
    countryBarRadius: 216,
    yearRadius: 216 + 62,
  };

  const bounds = d3
    .select("#wrapper")
    .append("svg")
    .attr(
      "viewBox",
      `${-dimensions.width / 2} ${-dimensions.height / 2} ${dimensions.width} ${
        dimensions.height
      }`
    )
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    .append("g");

  function drawPieChart() {
    const arc = d3
      .arc()
      .innerRadius(dimensions.pieInnerRadius)
      .outerRadius(dimensions.pieOuterRadius);

    const pie = d3.pie().sort(null);

    // const dataset_init = [0, 0, 0, 0, 0, 0, 1];
    const allPath = bounds
      .selectAll("path")
      // .data(pie(dataset_init))
      .data(pie(secondPieData[115]))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => {
        if (i == 5) return "#5c5c5c";
        if (i == 6) return "#FFFFFF";
        return nobelDotColor[i];
      });
  }

  drawPieChart();

  const axis = bounds.append("g").attr("class", "grid-line");

  const countryScale = d3
    .scaleLinear()
    .domain([0, countryList.length])
    .range([0, Math.PI * 2]);

  const getCoordinatesForAngle = (angle, radius) => [
    Math.cos(angle - Math.PI / 2) * radius,
    Math.sin(angle - Math.PI / 2) * radius,
  ];

  function drawAxis() {
    d3.range(5).map((i) => {
      const cr =
        dimensions.ageInnerRadius +
        (i * (dimensions.ageOuterRadius - dimensions.ageInnerRadius)) / 4;
      axis.append("circle").attr("r", cr);

      axis
        .append("text")
        .attr("y", -cr)
        .attr("dx", ".2em")
        .attr("dy", "-.5em")
        .text(i != 4 ? (i + 1) * 20 : "");
    });

    countryList.map((country, i) => {
      const [x1, y1] = getCoordinatesForAngle(
        countryScale(i),
        dimensions.ageInnerRadius
      );
      const [x2, y2] = getCoordinatesForAngle(
        countryScale(i),
        dimensions.ageOuterRadius
      );
      // console.log(x1, y1, x2, y2);

      axis
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
    });
  }
  drawAxis();

  // title
  const title = bounds
    .append("g")
    .attr("text-anchor", "middle")
    .attr("font-size", "1.7em")
    .attr("font-family", "Arial")
    .attr("cursor", "pointer");
  title.append("text").text("诺贝尔奖").attr("dy", "-.5em");
  title
    .append("text")
    .text("1901-2015")
    .attr("font-size", ".9em")
    .attr("dy", "1.2em");

  let countryPrize = personCountPerYP[114];
  let new_countryPrize = [];
  const keys = ["物理", "化学", "生理或医药", "文学", "经济"];
  console.log(keys);
  console.log(countryPrize);
  countryPrize.forEach((arr, i) => {
    const new_item = {};
    arr.forEach((item, j) => {
      new_item[keys[j]] = item;
    });
    new_item["sum"] = d3.sum(arr);
    new_countryPrize.push(new_item);
  });

  const stackedData = d3.stack().keys(keys)(new_countryPrize);
  console.log(stackedData); // 42=>5 同一组的同一个奖项的同一个group

  // text 排列，参考这个实现
  // https://observablehq.com/@d3/radial-stacked-bar-chart
  function drawCountry() {
    countryList.map((country, i) => {
      const [x, y] = getCoordinatesForAngle(
        countryScale(i),
        dimensions.countryBarRadius
      );

      const countryGroup = bounds
        .append("g")
        .attr(
          "transform",
          `rotate(${(countryScale(i) * 180) / Math.PI - 90}) translate(${
            dimensions.countryBarRadius - 5
          }, 0)`
        );

      countryGroup
        .append("text")
        .text(country)
        .attr("fill", "#a29bfe")
        .style("text-anchor", (d) =>
          countryScale(i) < Math.PI ? "start" : "end"
        )
        .attr("transform", (d) =>
          countryScale(i) < Math.PI
            ? "translate(0, 15)"
            : "rotate(-180) translate(0,-7)"
        );
    });
  }

  drawCountry();

  // https://www.d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
  // 显示效果不对，仍有 bug
  function drawCountryPrizeBarChart() {
    const stackBar = bounds
      .append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", (d, idx) => nobelDotColor[idx]);

    stackBar
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr(
        "transform",
        (d, i) =>
          `rotate(${(countryScale(i) * 180) / Math.PI - 90}) translate(${
            dimensions.countryBarRadius - 4
          }, 20)`
      )
      .attr("x", (d) => Math.sqrt(Math.sqrt(d[0])) * 10)
      .attr("height", 10)
      .attr("width", (d) => Math.sqrt(Math.sqrt(d[1] - d[0])) * 10);
  }

  drawCountryPrizeBarChart();

  function drawLegend() {
    const legend = bounds
      .append("g")
      .selectAll("g")
      .data(keys)
      .join("g")
      .attr("transform", (d, i) => `translate(-300, ${200 + 20 * i})`);

    legend
      .append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (d, i) => nobelDotColor[i]);

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text((d) => d);
  }

  drawLegend();

  function drawEachPrizeCircle() {
    // iAll 国家 / jAll 年龄段 / kAll 各奖项人数，也是审查可视化图表时根据 class 发现的
    d3.range(countryList.length).map((iAll) => {
      d3.range(5).map((jAll) => {
        d3.range(5).map((kAll) => {
          const angle =
            countryScale(iAll) +
            ((kAll + 1) * ((2 * Math.PI) / countryList.length)) / 6;
          const age = 10 + jAll * 20;
          const personAgeToPoint = 90 - ((age - 20) / 80) * 75;
          const radius = dimensions.countryBarRadius - personAgeToPoint;
          const [x, y] = getCoordinatesForAngle(angle, radius);

          bounds
            .selectAll(`.AllPerson${iAll}`)
            .data(nbAllPerson[iAll][jAll])
            .join("circle")
            .attr("class", `allPersonPoints_${iAll}_${jAll}_${kAll}`)
            .attr("fill-opacity", 0.2)
            .attr("fill", nobelDotColor[kAll])
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 1.5 * Math.sqrt(nbAllPerson[iAll][jAll][kAll]));
        });
      });
    });
  }

  drawEachPrizeCircle();

  function drawYear() {
    const yearRange = 116;
    const yearScale = d3
      .scaleLinear()
      .domain([0, yearRange])
      .range([0, 2 * Math.PI]);
    d3.range(yearRange).map((year) => {
      const [x, y] = getCoordinatesForAngle(
        yearScale(year),
        dimensions.yearRadius
      );

      const yearGroup = bounds
        .append("g")
        .attr(
          "transform",
          `rotate(${(yearScale(year) * 180) / Math.PI - 90}) translate(${
            dimensions.yearRadius + 10
          }, 0)`
        );
      const rect = yearGroup
        .append("rect")
        .attr("class", "perYearButton_" + year)
        .attr("id", "" + year)
        .attr("width", 30)
        .attr("height", 16)
        .attr("fill", "#ACEDED")
        .attr("fill-opacity", year == 0 ? 1 : 0)
        .attr("cursor", "pointer");

      yearGroup
        .append("text")
        .text(year == 0 ? "ALL" : year % 10 == 0 ? 1900 + year : "-")
        .attr("dy", "1.1em")
        .attr("class", "timeText_" + year)
        .attr("fill", "#000000")
        .attr("font-size", 12)
        .attr("font-family", "Arial")
        .attr("fill-opacity", 1)
        .attr("cursor", "pointer")
        .attr("pointer-events", "none")
        .attr("text-anchor", (d) =>
          yearScale(year) < Math.PI ? "start" : "end"
        )
        .attr("transform", (d) =>
          yearScale(year) < Math.PI
            ? "rotate(0)"
            : "rotate(-180) translate(0, -20)"
        );

      rect
        .on("mouseover", function () {
          // 背景及年份文字
          d3.select(this).transition().duration(100).attr("fill-opacity", 1);

          d3.select(".timeText_" + d3.select(this).attr("id"))
            .transition()
            .duration(100)
            .text(year == 0 ? "ALL" : 1900 + year)
            .attr("fill-opacity", 1);
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(500).attr("fill-opacity", 0);

          d3.select(".timeText_" + d3.select(this).attr("id"))
            .transition()
            .duration(100)
            // .attr("fill-opacity", 0);
            .text(year == 0 ? "ALL" : year % 10 == 0 ? 1900 + year : "-");
        });
    });
  }

  drawYear();
}

drawChart();
