import { test, expect, Page } from "@playwright/test";

function mock_demo(page: Page, demo: string) {
	return page.route("**/config", (route) => {
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			path: `../../../demo/${demo}/config.json`
		});
	});
}

function mock_api(page: Page, body: Array<unknown>) {
	return page.route("**/api/predict/", (route) => {
		const id = JSON.parse(route.request().postData()!).fn_index;
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			body: JSON.stringify({
				data: body[id]
			})
		});
	});
}

// test("renders the correct elements", async ({ page }) => {
// 	await mock_demo(page, "kitchen_sink");
// 	await page.goto("http://localhost:3000");

// 	const description = await page.locator(".output-markdown");
// });

test("can run an api request and display the data", async ({ page }) => {
	await mock_demo(page, "kitchen_sink");


    await mock_api(page, [[
        "the quick brown fox, selected:foo, baz",
        {
          "label": "negative",
          "confidences": [
            {
              "label": "negative",
              "confidence": 0.46153846153846156
            },
            {
              "label": "positive",
              "confidence": 0.38461538461538464
            },
            {
              "label": "neutral",
              "confidence": 0.15384615384615385
            }
          ]
        },
        [
          [
            "The",
            "art"
          ],
          [
            "quick brown",
            "adj"
          ],
          [
            "fox",
            "nn"
          ],
          [
            "jumped",
            "vrb"
          ],
          [
            "testing testing testing",
            null
          ],
          [
            "over",
            "prp"
          ],
          [
            "the",
            "art"
          ],
          [
            "testing",
            null
          ],
          [
            "lazy",
            "adj"
          ],
          [
            "dogs",
            "nn"
          ],
          [
            ".",
            "punc"
          ],
          [
            "test 0",
            "test 0"
          ],
          [
            "test 1",
            "test 1"
          ],
          [
            "test 2",
            "test 2"
          ],
          [
            "test 3",
            "test 3"
          ],
          [
            "test 4",
            "test 4"
          ],
          [
            "test 5",
            "test 5"
          ],
          [
            "test 6",
            "test 6"
          ],
          [
            "test 7",
            "test 7"
          ],
          [
            "test 8",
            "test 8"
          ],
          [
            "test 9",
            "test 9"
          ]
        ],
        [
          [
            "The testing testing testing",
            null
          ],
          [
            "over",
            0.6
          ],
          [
            "the",
            0.2
          ],
          [
            "testing",
            null
          ],
          [
            "lazy",
            -0.1
          ],
          [
            "dogs",
            0.4
          ],
          [
            ".",
            0
          ],
          [
            "test",
            -1
          ],
          [
            "test",
            -0.9
          ],
          [
            "test",
            -0.8
          ],
          [
            "test",
            -0.7
          ],
          [
            "test",
            -0.6
          ],
          [
            "test",
            -0.5
          ],
          [
            "test",
            -0.4
          ],
          [
            "test",
            -0.3
          ],
          [
            "test",
            -0.2
          ],
          [
            "test",
            -0.1
          ],
          [
            "test",
            0
          ],
          [
            "test",
            0.1
          ],
          [
            "test",
            0.2
          ],
          [
            "test",
            0.3
          ],
          [
            "test",
            0.4
          ],
          [
            "test",
            0.5
          ],
          [
            "test",
            0.6
          ],
          [
            "test",
            0.7
          ],
          [
            "test",
            0.8
          ],
          [
            "test",
            0.9
          ]
        ],
        {
          "items": {
            "item": [
              {
                "id": "0001",
                "type": null,
                "is_good": false,
                "ppu": 0.55,
                "batters": {
                  "batter": [
                    {
                      "id": "1001",
                      "type": "Regular"
                    },
                    {
                      "id": "1002",
                      "type": "Chocolate"
                    },
                    {
                      "id": "1003",
                      "type": "Blueberry"
                    },
                    {
                      "id": "1004",
                      "type": "Devil's Food"
                    }
                  ]
                },
                "topping": [
                  {
                    "id": "5001",
                    "type": "None"
                  },
                  {
                    "id": "5002",
                    "type": "Glazed"
                  },
                  {
                    "id": "5005",
                    "type": "Sugar"
                  },
                  {
                    "id": "5007",
                    "type": "Powdered Sugar"
                  },
                  {
                    "id": "5006",
                    "type": "Chocolate with Sprinkles"
                  },
                  {
                    "id": "5003",
                    "type": "Chocolate"
                  },
                  {
                    "id": "5004",
                    "type": "Maple"
                  }
                ]
              }
            ]
          }
        },
        "<button style='background-color: red'>Click Me: baz</button>"
      ]]);


	await page.goto("http://localhost:3000");

	const submit_button = await page.locator("button", { hasText: /Submit/ });

	await Promise.all([
		submit_button.click(),
		page.waitForResponse("**/api/predict/")
	]);

  const label = await page.locator("data-testid=label");

	await expect(label).toContainText(`negative
    negative
    46%
    positive
    38%
    neutral
    15%`);

  const highlight_text_color_map = await page.locator('data-testid=highlighted-text').nth(0);
  const highlight_text_legend = await page.locator('data-testid=highlighted-text').nth(1);
  await expect(highlight_text_color_map).toContainText('  HighlightedText  The art quick brown adj fox nn jumped vrb testing testing testing  over prp the art testing  lazy adj dogs nn . punc test 0 test 0 test 1 test 1 test 2 test 2 test 3 test 3 test 4 test 4 test 5 test 5 test 6 test 6 test 7 test 7 test 8 test 8 test 9 test 9');
  await expect(highlight_text_legend).toContainText('The testing testing testing over the testing lazy dogs . test test test test test test test test test test test test test test test test test test test test');

  const click_me_button =await page.locator("button", { hasText: /Click Me: baz/ });
  click_me_button.click()

	const json = await page.locator("data-testid=json");
	await expect(json).toContainText(`{
        items:  {
        item:  [
        0:  {
        id:  "0001",
        type:  null,
        is_good:  false,
        ppu:  0.55,
        batters:  {
        batter:  expand 4 children
        },
        topping:  [
        0:  {+2 items} ,
        1:  {+2 items} ,
        2:  {+2 items} ,
        3:  {+2 items} ,
        4:  {+2 items} ,
        5:  {+2 items} ,
        6:  {+2 items}
        ]
        }
        ]
        }
        }`);
});
