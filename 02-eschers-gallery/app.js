async function drawChart() {
  const data = await d3.json("./data.json");

  const svg = d3.select("#chart");
  const bounds = svg.append("g");

  // console.log([...new Set(data.map((d) => d.style))]);
  // ["Surrealism", "Realism", "Expressionism", "Cubism", "Op Art", "Art Nouveau (Modern)", "Northern Renaissance", "Art Deco"]

  data.map((d) => {
    d.date = d.date !== "?" ? +d.date : "?";
    d.style = d.style === "Op Art" ? "Optical art" : d.style;
    d.style2 = [
      "Surrealism",
      "Realism",
      "Expressionism",
      "Cubism",
      "Optical art",
    ].includes(d.style)
      ? d.style
      : "Other";
  });
  console.log(data);

  // https://observablehq.com/@d3/d3-group
  const styleCountMap = d3.rollup(
    data,
    (v) => v.length,
    (d) => d.style2
  );
  // console.log("styleCount :", styleCountMap);
  const styleCount = [];
  for (const [style, count] of styleCountMap) {
    styleCount.push({ style, count });
  }
  // console.log(styleCount);

  // 一列最多8组共24个；分成7个年龄组
  // 1898-1917 = 14
  // 1918-1927 = 28*3+1 = 85 // 99
  // 1928-1937 = 7*8*3+6 = 174 // 273
  // 1938-1947 = 62 // 335
  // 1948-1957 = 27 * 3 = 81 // 416
  // 1958-1972 = 14*3-1 = 41 // 457
  // 1973- = 13
  const dateGroup = d3.range(7).map(() => []);
  data.forEach((d) => {
    date = d.date;
    if (date === "?") dateGroup[6].push(d);
    else if (date < 1918) dateGroup[0].push(d);
    else if (date < 1928) dateGroup[1].push(d);
    else if (date < 1938) dateGroup[2].push(d);
    else if (date < 1948) dateGroup[3].push(d);
    else if (date < 1958) dateGroup[4].push(d);
    else if (date < 1973) dateGroup[5].push(d);
  });
  // console.log(dateGroup);

  const colorScale = {
    "Optical art": "#ffc533",
    Surrealism: "#f25c3b",
    Expressionism: "#5991c2",
    Realism: "#55514e",
    Cubism: "#5aa459",
    Other: "#bdb7b7",
  };

  const getXY = (idx) => {
    let col;
    let row;
    if (idx < 14) {
      col = 1;
      row = parseInt((idx % 24) / 3) + 1;
      groupIdx = idx;
    } else if (idx < 99) {
      groupIdx = idx - 14;
      col = 1 + parseInt(groupIdx / 24) + 1;
      row = parseInt((groupIdx % 24) / 3) + 1;
    } else if (idx < 273) {
      groupIdx = idx - 99;
      col = 5 + parseInt(groupIdx / 24) + 1;
      row = parseInt((groupIdx % 24) / 3) + 1;
    } else if (idx < 335) {
      groupIdx = idx - 273;
      col = 13 + parseInt(groupIdx / 24) + 1;
      row = parseInt((groupIdx % 24) / 3) + 1;
    } else if (idx < 416) {
      groupIdx = idx - 335;
      col = 16 + parseInt(groupIdx / 24) + 1;
      row = parseInt((groupIdx % 24) / 3) + 1;
    } else if (idx < 457) {
      groupIdx = idx - 416;
      col = 20 + parseInt(groupIdx / 24) + 1;
      row = parseInt((groupIdx % 24) / 3) + 1;
    } else {
      groupIdx = idx - 457;
      col = 22 + parseInt(groupIdx / 24) + 1;
      row = parseInt((groupIdx % 24) / 3) + 1;
    }
    return [groupIdx, col, row];
  };

  // 方法1
  const cubeWidth = 32;
  // 方法2
  // const cubeWidth = (32 / 2) * Math.sqrt(3); // 36; // 40
  //  2%3=2  parseInt(4/3)=1  or Math.floor(4/3)
  const artworkGroup = bounds
    .append("g")
    .attr("class", "main-chart")
    .attr("transform", `scale(1.12)`);

  function drawArtwork() {
    const artworks = artworkGroup
      .selectAll("use.artwork")
      .data(data)
      .join("use")
      .attr("class", "artwork")
      .attr("xlink:href", (d, i) =>
        getXY(i)[0] % 3 === 0
          ? "#unit-0"
          : getXY(i)[0] % 3 === 1
          ? "#unit-1"
          : "#unit-2"
      )
      .attr("fill", (d) => colorScale[d.style2])
      .attr("stroke", "white")
      .attr("data-index", (d) => d.style2)
      .attr("id", (d, i) => i)
      // 40 cubeWidth=40  x -150 // y 70+
      // 36 cubeWidth=36  x -80 // y 110+
      .attr("x", (d, i) => getXY(i)[1] * 1.5 * cubeWidth - 80)
      .attr(
        "y",
        (d, i) =>
          110 +
          getXY(i)[2] * 1.5 * cubeWidth +
          (getXY(i)[1] % 2 === 0 ? 0 : 0.75 * cubeWidth)
      );
  }
  drawArtwork();

  function drawBlankArtwork() {
    // bottom odd 9 / even 10
    const rawMax = [
      5,
      8,
      8,
      8,
      5,
      8,
      8,
      8,
      8,
      8,
      8,
      8,
      2,
      8,
      8,
      5,
      8,
      8,
      8,
      3,
      8,
      6,
      5,
    ];
    // console.log(rawMax.length); // 23
    const blank = [];
    d3.range(1, 24).map((d) => {
      // top odd 0/-1 / even 0
      d % 2 === 0
        ? blank.push({ x: d, y: 0 })
        : blank.push({ x: d, y: 0 }, { x: d, y: -1 });
      // bottom odd 9 / even 10
      if (d % 2 === 0) {
        for (let i = rawMax[d - 1] + 1; i <= 10; i++)
          blank.push({ x: d, y: i });
      } else {
        for (let i = rawMax[d - 1] + 1; i <= 9; i++) blank.push({ x: d, y: i });
      }
    });
    // console.log(blank);

    let blankData = [];
    blank.map((d) => {
      // repeat 3 times
      d3.range(3).map(() => blankData.push({ x: d.x, y: d.y }));
    });
    const specialBlank = [
      { x: 1, y: 5, unit: 2 },
      { x: 5, y: 5, unit: 1 },
      { x: 5, y: 5, unit: 2 },
      { x: 16, y: 5, unit: 2 },
      { x: 22, y: 6, unit: 2 },
      { x: 23, y: 5, unit: 1 },
      { x: 23, y: 5, unit: 2 },
    ];
    blankData = [...blankData, ...specialBlank];

    const blankArtworks = artworkGroup
      .selectAll("use.blank")
      .data(blankData)
      .join("use")
      .attr("class", "blank")
      .attr("xlink:href", (d, i) =>
        d.unit
          ? `#unit-${d.unit}`
          : i % 3 === 0
          ? "#unit-0"
          : i % 3 === 1
          ? "#unit-1"
          : "#unit-2"
      )
      .attr("fill", "#f2f2e8")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("x", (d) => d.x * 1.5 * cubeWidth - 80)
      .attr(
        "y",
        (d) =>
          110 + d.y * 1.5 * cubeWidth + (d.x % 2 === 0 ? 0 : 0.75 * cubeWidth)
      );
  }

  drawBlankArtwork();

  const tooltip = d3.select("#tooltip");

  svg.on("click", displayTooltip);

  function displayTooltip() {
    tooltip.style("opacity", 0);
  }

  d3.selectAll("use.artwork").on("click", showTooltip);
  // .on('mouseleave', onMouseLeave)

  function showTooltip(datum) {
    // console.log(this)
    tooltip.style("opacity", 1);
    tooltip.select("#title").text(datum.title);
    tooltip
      .select("#date")
      .text(datum.date !== "?" ? datum.date : "Year Unknown");
    tooltip.select("#style").text(datum.style);
    tooltip.select("#genre").text(datum.genre);
    tooltip.select("#image img").attr("src", datum.img);
    tooltip.select("#url a").attr("href", datum.url);

    let [x, y] = d3.mouse(this);
    // console.log(x, y);
    x = x > 700 ? x - 300 : x;
    y = y > 450 ? y - 300 : y;
    tooltip.style("left", `${x + 100}px`).style("top", `${y + 50}px`);

    d3.event.stopPropagation();
  }

  // function onMouseLeave() {
  //     tooltip.style('opacity', 0)
  // }

  function drawDateInfo() {
    const dateText = [
      { col: 1, shortLine: false, age: "age<20", range: "1898-" },
      { col: 2, shortLine: true, age: "20-29", range: "1918-1927" },
      { col: 6, shortLine: true, age: "30-39", range: "1928-1937" },
      { col: 14, shortLine: true, age: "40-49", range: "1938-1947" },
      { col: 17, shortLine: false, age: "50-59", range: "1948-1957" },
      { col: 21, shortLine: false, age: "60-69", range: "1958-1972" },
      { col: 23, shortLine: false, age: "", range: "Year Unknown" },
    ];
    const dateTextGroup = artworkGroup.selectAll("g").data(dateText).join("g");

    dateTextGroup
      .append("text")
      .text((d) => d.age)
      .style("text-anchor", "start")
      .attr("x", (d, i) => d.col * 1.5 * cubeWidth + (i === 0 ? 34 : 42))
      .attr("y", 195)
      .attr("font-size", 13);

    dateTextGroup
      .append("text")
      .text((d) => d.range)
      .style("text-anchor", "start")
      .attr("x", (d, i) => d.col * 1.5 * cubeWidth + (i === 6 ? 30 : 35))
      .attr("y", 210)
      .attr("fill", "grey")
      .attr("font-size", 11);

    dateTextGroup
      .append("line")
      .attr("x1", (d, i) => d.col * 1.5 * cubeWidth + 63)
      .attr("x2", (d, i) => d.col * 1.5 * cubeWidth + 63)
      .attr("y1", 215)
      .attr("y2", (d) => (d.shortLine ? 246 : 270))
      .attr("stroke", "#2980b9")
      .attr("stroke-dasharray", "1px 1px");
  }

  drawDateInfo();

  function drawTitle() {
    // title
    const title = bounds
      .append("text")
      .text("Escher's Gallery")
      .attr("x", 90)
      .attr("y", 90)
      .attr("text-anchor", "start")
      .attr("font-size", 40)
      .attr("font-weight", "bold");

    const subTitle = bounds.append("g").attr("class", "sub-title");
    subTitle
      .append("text")
      .text("470 pieces of artwork by Dutch Artist")
      .attr("x", 90)
      .attr("y", 125)
      .attr("font-size", 16);

    subTitle
      .append("a")
      .attr("href", "https://en.wikipedia.org/wiki/M._C._Escher")
      .attr("target", "_blank")
      .append("text")
      .text("M.C.Escher(1898-1972).")
      .attr("x", 376)
      .attr("y", 125)
      .attr("fill", "#5991c2")
      .attr("font-size", 16);
  }
  drawTitle();

  // piece example
  function drawAnno() {
    const anno = bounds.append("g").attr("transform", "translate(530, 25)");

    const annoArtwork = anno
      .append("use")
      .attr("xlink:href", "#unit-0")
      .attr("fill", "#bdb7b7")
      .attr("x", 120)
      .attr("y", -30);

    const annoText = anno
      .append("text")
      .text("A piece of artwork(click it)")
      .attr("x", 180)
      .attr("y", 100)
      .attr("fill", "grey")
      .attr("font-size", 13);
  }
  drawAnno();

  // style bar chart
  function drawStyleLegend() {
    const countScale = d3
      .scaleLinear()
      .domain([0, d3.max(styleCount, (d) => d.count)])
      .range([0, 200]);

    const legend = bounds.append("g").attr("transform", "translate(1000, 40)");

    const legendTitle = legend
      .append("text")
      .text("Number of artworks by style")
      .attr("x", 20)
      .attr("y", 10);

    const legendGroup = legend
      .selectAll("g")
      .data(styleCount.sort((a, b) => b.count - a.count))
      .join("g")
      .attr("transform", (d, i) => `translate(110, ${28 + 15 * i})`);

    const lengedStyleText = legendGroup
      .append("text")
      .text((d) => d.style) // this's style2
      .attr("x", -90)
      .attr("y", 6)
      .attr("text-anchor", "start")
      .attr("fill", "grey")
      .attr("font-size", 11);

    const lengedRect = legendGroup
      .append("rect")
      .attr("width", (d) => countScale(d.count))
      .attr("height", 8)
      .attr("fill", (d) => colorScale[d.style]);

    const lengedStyleCountText = legendGroup
      .append("text")
      .text((d) => d.count)
      .attr("x", (d) => countScale(d.count) + 10)
      .attr("y", 8)
      .attr("fill", (d) => colorScale[d.style])
      .attr("font-size", 11);
  }

  drawStyleLegend();

  // data source  // author
  function drawDesc() {
    const descLeft = artworkGroup.append("g").attr("class", "desc-left");

    descLeft
      .append("text")
      .text("Data source and images: ")
      .attr("x", 80)
      .attr("y", 690)
      .attr("font-size", 12);

    descLeft
      .append("a")
      .attr("href", "https://www.wikiart.org/en/m-c-escher")
      .attr("target", "_blank")
      .append("text")
      .text("https://www.wikiart.org/en/m-c-escher")
      .attr("x", 224)
      .attr("y", 690)
      .attr("fill", "#5991c2")
      .attr("font-size", 12);

    const descRight = artworkGroup.append("g").attr("class", "desc-right");

    descRight
      .append("text")
      .text("Origin: Tableau | Wendy Shijia | @ShijiaWendy | 24 August 2020 | ")
      .attr("x", 604)
      .attr("y", 680)
      .attr("font-size", 12);

    descRight
      .append("a")
      .attr(
        "href",
        "https://public.tableau.com/profile/wendy.shijia#!/vizhome/MCEschersGallery_15982882031370/Gallery"
      )
      .attr("target", "_blank")
      .append("text")
      .text("Tableau: Wendy Shijia/Escher's Gallery")
      .attr("x", 970)
      .attr("y", 680)
      .attr("fill", "#5991c2")
      .attr("font-size", 12);

    descRight
      .append("text")
      .text("Reproduced: D3.js | 古柳Guliu | @Deserts_X | 22 October 2020 | ")
      .attr("x", 604)
      .attr("y", 700)
      .attr("font-size", 12);

    descRight
      .append("a")
      .attr("href", "https://github.com/DesertsX/dataviz-in-action")
      .attr("target", "_blank")
      .append("text")
      .text("GitHub: DesertsX/dataviz-in-action")
      .attr("x", 964)
      .attr("y", 700)
      .attr("fill", "#5991c2")
      .attr("font-size", 12);

    // Wendy Shijia @ShijiaWendy
    // https://twitter.com/ShijiaWendy/status/1297950623141203968

    // https://github.com/DesertsX/dataviz-in-action
    // @Deserts_X
    // https://twitter.com/Deserts_X
  }
  drawDesc();
}

drawChart();
