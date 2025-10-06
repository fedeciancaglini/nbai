"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { nbaCardSchema } from "@/lib/schema";
import Image from "next/image";

export default function Home() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { object, submit, isLoading, error } = useObject({
    api: "/api/analyze",
    schema: nbaCardSchema,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleAnalyze = async () => {
    if (selectedImages.length === 0) return;

    // Convert images to base64 data URLs
    const imageDataUrls = await Promise.all(
      selectedImages.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );

    submit({ images: imageDataUrls });
  };

  const handleReset = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <main className="flex flex-col gap-8 items-center w-full max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">NBAi ✨</h1>
          <p className="text-muted-foreground">
            Upload PSA-graded NBA card images for AI-powered analysis
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Upload Card Images</CardTitle>
            <CardDescription>
              Select one or more images of PSA-graded NBA cards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images">Card Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden border"
                  >
                    <Image
                      src={preview}
                      layout="fill"
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={selectedImages.length === 0 || isLoading}
                className="flex-1"
              >
                {isLoading ? "Analyzing..." : "Analyze Card"}
              </Button>
              {selectedImages.length > 0 && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={isLoading}
                >
                  Reset
                </Button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {(object?.cards || isLoading) && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold">
                Analysis Results{" "}
                {object?.cards?.length
                  ? `(${object.cards.length} card${
                      object.cards.length > 1 ? "s" : ""
                    })`
                  : ""}
              </h2>
              {object?.cards && object.cards.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {object.cards.filter(c => c?.isValid !== false).length} valid • {object.cards.filter(c => c?.isValid === false).length} invalid
                </p>
              )}
            </div>

            {isLoading && !object?.cards?.length && (
              <Card className="w-full">
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    Analyzing cards...
                  </p>
                </CardContent>
              </Card>
            )}

            {object?.cards?.map((card, index) => (
              <Card key={index} className={`w-full ${card?.isValid === false ? 'border-destructive' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Card {index + 1}
                    {card?.isValid === false && (
                      <span className="text-sm font-normal text-destructive">⚠️ Invalid</span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {card?.isValid === false ? (
                      <span className="text-destructive">{card.validationError || "Not a valid PSA NBA card"}</span>
                    ) : (
                      <>
                        {card?.playerName || "Loading..."}{" "}
                        {card?.cardYear && `• ${card.cardYear}`}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                {card?.isValid !== false && (
                  <CardContent>
                    <div className="space-y-3">
                    <ResultField label="Player Name" value={card?.playerName} />
                    <ResultField label="Team" value={card?.teamName} />
                    <ResultField label="Year" value={card?.cardYear} />
                    <ResultField label="Brand" value={card?.cardBrand} />
                    <ResultField label="Series" value={card?.cardSeries} />
                    <ResultField label="Card Number" value={card?.cardNumber} />
                    <ResultField label="PSA Grade" value={card?.psaGrade} />
                    <ResultField
                      label="PSA Cert #"
                      value={card?.psaCertNumber}
                    />
                    <ResultField label="Card Type" value={card?.cardType} />
                    <ResultField
                      label="Rookie Card"
                      value={
                        card?.isRookieCard !== undefined
                          ? card.isRookieCard
                            ? "Yes"
                            : "No"
                          : undefined
                      }
                    />
                    <ResultField
                      label="Condition"
                      value={card?.cardCondition}
                    />
                    <ResultField
                      label="Special Features"
                      value={card?.specialFeatures}
                    />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ResultField({
  label,
  value,
}: {
  label: string;
  value?: string | boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <span className="font-medium text-sm text-muted-foreground">
        {label}:
      </span>
      <span className="col-span-2 text-sm">
        {value !== undefined && value !== "" ? (
          value
        ) : (
          <span className="text-muted-foreground italic">Loading...</span>
        )}
      </span>
    </div>
  );
}
