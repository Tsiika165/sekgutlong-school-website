import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { Image as ImageIcon, X, PlayCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

const ITEMS_PER_LOAD = 6;

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  const categories = [
    { id: "all", name: "All Media" },
    { id: "image", name: "Images" },
    { id: "video", name: "Videos" },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching gallery:", error.message);
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setGalleryItems(data || []);
        setLoading(false);
      }
    };

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return selectedCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.media_type === selectedCategory);
  }, [galleryItems, selectedCategory]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setVisibleCount(ITEMS_PER_LOAD);
  };

  return (
    <PageLayout title="Gallery" subtitle="Moments from our school life">
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                selectedCategory === category.id
                  ? "bg-amber-600 text-white"
                  : "bg-amber-100 text-amber-900 hover:bg-amber-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-600">Loading gallery...</p>
      )}

      {!loading && galleryItems.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No media available yet.</p>
        </div>
      )}

      {!loading && galleryItems.length > 0 && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            No {selectedCategory === "image" ? "images" : "videos"} found.
          </p>
        </div>
      )}

      {!loading && filteredItems.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-amber-200 shadow-sm hover:shadow-xl transition"
              >
                <div className="relative">
                  {item.media_type === "image" ? (
                    <img
                      src={item.file_url}
                      alt={item.title}
                      className="w-full h-64 object-cover cursor-pointer hover:scale-[1.02] transition"
                      onClick={() => setSelectedImage(item)}
                    />
                  ) : (
                    <div className="relative">
                      <video
                        src={item.file_url}
                        controls
                        className="w-full h-64 object-cover bg-black"
                      >
                        Your browser does not support the video tag.
                      </video>

                      <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        Video
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-amber-900 text-lg">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-3 bg-amber-600 text-white inline-block px-3 py-1 rounded-full text-xs capitalize">
                    {item.media_type}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_LOAD)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Load More Media
              </button>
            </div>
          )}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={selectedImage.file_url}
                alt={selectedImage.title}
                className="w-full max-h-[75vh] object-contain bg-black"
              />

              <div className="p-5">
                <h3 className="text-2xl font-bold text-amber-900">
                  {selectedImage.title}
                </h3>

                {selectedImage.description && (
                  <p className="text-gray-700 mt-2 leading-relaxed">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Gallery;
