package githubapi

import "time"

func DeleteOldReleates() {
	page := 1
	perPage := 100
	now := time.Now()
	for {
		releases, _ := Releases("sincerely", page, perPage)
		page++
		for _, release := range releases {
			if now.After(release.GetCreatedAt().Time.Add(time.Hour * 24 * 30)) {
				println(release, release.CreatedAt.String(), release.Name)

				DeleteTag("sincerely", *release.TagName)
				DeleteRelease("sincerely", *release.ID)
			}

		}

		if len(releases) < perPage {
			break
		}
	}
}
