import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesApi, Category } from "../../api/categories";
import { servicesApi } from "../../api/services";
import { useTheme } from "../../context/ThemeContext";

interface CategoryWithCount extends Category {
  serviceCount?: number;
}

export default function CategoryGrid() {
  const navigate = useNavigate();
  const { darkMode: dm } = useTheme();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, services] = await Promise.all([
          categoriesApi.getAll(),
          servicesApi.search(),
        ]);

        const catsArray = Array.isArray(cats) ? cats : [];
        const servicesArray = Array.isArray(services) ? services : [];

        // Count services per category
        const catMap = new Map<number, number>();
        servicesArray.forEach((s) => {
          if (s.categoryId) {
            catMap.set(s.categoryId, (catMap.get(s.categoryId) || 0) + 1);
          }
        });

        const withCounts = catsArray.map((cat) => ({
          ...cat,
          serviceCount: catMap.get(cat.id) || 0,
        }));

        setCategories(withCounts);
      } catch (e) {
        console.error("Failed to load categories:", e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/browse?category=${categoryId}`);
  };

  const getEmoji = (name: string): string => {
    const map: Record<string, string> = {
      "design": "✨",
      "development": "🚀",
      "writing": "🖋️",
      "marketing": "📈",
      "business": "💼",
      "teaching": "📚",
      "music": "🎧",
      "video": "🎥",
      "photography": "📸",
      "consulting": "💡",
      "web": "🖥️",
      "social": "💬",
      "seo": "🎯",
      "graphic": "🖌️",
      "animation": "🎞️",
    };

    const lower = name.toLowerCase();
    for (const [key, emoji] of Object.entries(map)) {
      if (lower.includes(key)) return emoji;
    }
    return "📌";
  };

  return (
    <section className={`py-16 px-8 transition-colors duration-300 ${dm ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${dm ? "text-red-400" : "text-red-600"}`}>
            EXPLORE BY CATEGORY
          </p>
          <h2
            className={`text-3xl sm:text-4xl font-extrabold ${dm ? "text-white" : "text-gray-900"}`}
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Browse Professional Services
          </h2>
          <p className={`mt-3 text-sm sm:text-base max-w-2xl mx-auto ${dm ? "text-gray-400" : "text-gray-600"}`}>
            Discover services across{" "}
            <span className="font-semibold">{categories.length} categories</span>
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className={`w-10 h-10 rounded-full border-4 border-transparent ${dm ? "border-t-red-600" : "border-t-red-700"} animate-spin`} />
          </div>
        ) : categories.length === 0 ? (
          <div className={`text-center py-16 ${dm ? "text-gray-400" : "text-gray-500"}`}>
            <p className="text-lg">No categories available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
                  dm
                    ? "bg-gray-800 border-gray-700 hover:border-red-600 hover:bg-gray-750"
                    : "bg-white border-gray-100 hover:border-red-600 hover:shadow-lg hover:shadow-red-100"
                }`}
                style={{
                  boxShadow: dm ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Emoji/Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    dm
                      ? "bg-red-900/20 group-hover:bg-red-800/30"
                      : "bg-red-50 group-hover:bg-red-100"
                  }`}
                >
                  {getEmoji(cat.name)}
                </div>

                {/* Category Name */}
                <h3
                  className={`text-sm font-bold text-center line-clamp-2 ${
                    dm ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {cat.name}
                </h3>

                {/* Service Count Badge */}
                {cat.serviceCount !== undefined && cat.serviceCount > 0 && (
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      dm
                        ? "bg-red-900/30 text-red-300"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cat.serviceCount} {cat.serviceCount === 1 ? "service" : "services"}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-600"} mb-4`}>
            Can't find what you're looking for?
          </p>
          <button
            onClick={() => navigate("/browse")}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              dm
                ? "bg-red-700 hover:bg-red-800 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            Advanced Search →
          </button>
        </div>
      </div>
    </section>
  );
}