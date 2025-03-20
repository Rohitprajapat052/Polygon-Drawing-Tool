import React, { useRef, useState, useEffect } from "react";

const COLORS = ["blue", "green", "purple", "red", "orange", "brown", "teal"];

const LIGHT_COLORS = {
  blue: "rgba(147, 197, 253, 0.5)", // blue-300
  green: "rgba(134, 239, 172, 0.5)", // green-300
  purple: "rgba(196, 181, 253, 0.5)", // purple-300
  red: "rgba(252, 165, 165, 0.5)", // red-300
  orange: "rgba(253, 186, 116, 0.5)", // orange-300
  brown: "rgba(181, 136, 99, 0.5)", // custom brown
  teal: "rgba(94, 234, 212, 0.5)", // teal-300
};

const PolygonDrawingTool = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPoint, setTempPoint] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [image, setImage] = useState(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    } else {
      drawGrid(ctx);
    }

    polygons.forEach(({ color, points }, index) => {
      const fillColor = LIGHT_COLORS[color] || "#ddd";
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();

      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });

      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw labels for points
      points.forEach((point, i) =>
        drawPointLabel(ctx, point, String.fromCharCode(65 + i), color)
      );

      // Calculate polygon center and draw the number
      if (points.length > 2) {
        // Ensure it's a valid polygon
        const centerX =
          points.reduce((sum, point) => sum + point.x, 0) / points.length;
        const centerY =
          points.reduce((sum, point) => sum + point.y, 0) / points.length;

        ctx.fillStyle = "black";
        ctx.font = "16px Arial bold";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(index + 1, centerX, centerY);
      }
    });

    if (points.length > 0) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      points.forEach((point, i) =>
        drawPointLabel(ctx, point, String.fromCharCode(65 + i), currentColor)
      );
    }

    if (tempPoint && points.length > 0) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(tempPoint.x, tempPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (points.length > 2) {
      const firstPoint = points[0];
      const lastPoint = tempPoint || points[points.length - 1];
      const distance = Math.sqrt(
        (lastPoint.x - firstPoint.x) ** 2 + (lastPoint.y - firstPoint.y) ** 2
      );
    
      if (distance < 10) {
        const text = "Drop to complete";
        ctx.font = "14px Arial";
        const textWidth = ctx.measureText(text).width;
        const padding = 8;
        const rectX = firstPoint.x - textWidth / 2 - padding;
        const rectY = firstPoint.y - 20;
        const rectWidth = textWidth + padding * 2;
        const rectHeight = 24;
        const borderRadius = 4; // Reduced roundness
      
        // Draw slightly rounded rectangle
        ctx.beginPath();
        ctx.moveTo(rectX + borderRadius, rectY);
        ctx.lineTo(rectX + rectWidth - borderRadius, rectY);
        ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + borderRadius);
        ctx.lineTo(rectX + rectWidth, rectY + rectHeight - borderRadius);
        ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - borderRadius, rectY + rectHeight);
        ctx.lineTo(rectX + borderRadius, rectY + rectHeight);
        ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - borderRadius);
        ctx.lineTo(rectX, rectY + borderRadius);
        ctx.quadraticCurveTo(rectX, rectY, rectX + borderRadius, rectY);
        ctx.closePath();
      
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"; // Background color
        ctx.fill();
      
        // Draw text
        ctx.fillStyle = "white"; 
        ctx.textAlign = "center";
        ctx.fillText(text, firstPoint.x, firstPoint.y - 5);
      }
      
    }
    
  };

  useEffect(() => {
    drawCanvas();
  }, [points, tempPoint, polygons, image]);

  const drawGrid = (ctx) => {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.font = "8px Arial";
    ctx.fillStyle = "#666";

    for (let x = 0; x <= 800; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
      ctx.fillText(x, x - 14, 548);
    }

    for (let y = 0; y <= 600; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
      ctx.fillText(y, 2, y + 6);
    }
  };

  const drawPointLabel = (ctx, point, label, color) => {
    ctx.fillStyle = "white";
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.font = "12px Arial bold";
    ctx.fillText(label, point.x - 4, point.y + 4);
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (points.length > 2) {
      const firstPoint = points[0];
      const distance = Math.sqrt(
        (x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2
      );

      if (distance < 10) {
        const polygonTag =
          prompt("Add tags for this ROI (comma separated):")?.trim() || "None";
        if (polygonTag) {
          setPolygons([
            ...polygons,
            { tag: polygonTag, points, color: currentColor },
          ]);
          setPoints([]);
          setIsDrawing(false);
          setTempPoint(null);
          setCurrentColor(COLORS[(polygons.length + 1) % COLORS.length]);
        }
        return;
      }
    }

    setPoints([...points, { x, y }]);
    setIsDrawing(true);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTempPoint({ x, y });
  };

  const handleReset = () => {
    setPoints([]);
    setTempPoint(null);
    setIsDrawing(false);
    setPolygons([]);
    setCurrentColor(COLORS[0]);
    setImage(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = URL.createObjectURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Polygon Drawing Tool</h1>
      <div className="flex gap-4 mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleButtonClick}
        >
          Upload Image
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={550}
        className="border border-gray-300"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      />
      <div className="mt-6 w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-2">Polygon Coordinates</h2>
        {polygons.map((polygon, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-bold">
              <a href="#" className="text-blue-600">{`Polygon ${index + 1}`}</a>
            </h3>
            <table className="w-full border-collapse border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Point
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    X
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Y
                  </th>
                </tr>
              </thead>
              <tbody>
                {polygon.points.map((point, i) => (
                  <tr key={i} className="border border-gray-300">
                    <td className="border border-gray-300 px-4 py-2">
                      {String.fromCharCode(65 + i)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Math.round(point.x)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Math.round(point.y)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border border-gray-300">
                  <td className="border border-gray-300 px-4 py-2 font-bold bg-gray-200">
                    Tags
                  </td>
                  <td
                    colSpan="2"
                    className="border border-gray-300 px-4 py-2 text-black"
                  >
                    {polygon.tag !== "None" ? `#${polygon.tag}` : "None"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolygonDrawingTool;
